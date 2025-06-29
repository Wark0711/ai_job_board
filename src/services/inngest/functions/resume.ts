import { db } from "@/drizzle/db";
import { inngest } from "../client";
import { userResumeTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { env } from "@/data/env/server";
import { updateUserResume } from "@/features/user/db/userResume";
import PDFParser from 'pdf2json';

export const createAiSummaryOfUploadedResume = inngest.createFunction(
    {
        id: "create-ai-summary-of-uploaded-resume",
        name: "Create AI Summary of Uploaded Resume",
    },
    {
        event: "app/resume.uploaded",
    },
    async ({ step, event }) => {
        const { id: userId } = event.user

        const userResume = await step.run("get-user-resume", async () => {
            return await db.query.userResumeTable.findFirst({
                where: eq(userResumeTable.userId, userId),
                columns: { resumeFileUrl: true },
            })
        })

        if (userResume == null) return

        const resumeText = await step.run("Download and extract text", async () => {
            const res = await fetch(userResume.resumeFileUrl);
            const buffer = await res.arrayBuffer();
            return await new Promise((resolve, reject) => {
                const pdfParser = new PDFParser();

                pdfParser.on('pdfParser_dataError', (errData) => {
                    console.error('PDF2JSON Parser Error:', errData.parserError);
                    reject(new Error('Failed to parse PDF with pdf2json.'));
                });

                pdfParser.on('pdfParser_dataReady', (data) => {
                    try {
                        const allText = data.Pages.map((page, index) => {
                            const decodedTexts = page.Texts.map(t =>
                                t.R.map(r => decodeURIComponent(r.T)).join('')
                            );
                            return decodedTexts.join(' ');
                        });

                        const fullText = allText.join('\n\n--- Page Break ---\n\n');
                        resolve(fullText);
                    } 
                    catch (e) {
                        reject(new Error("Error processing PDF text."));
                    }
                    // resolve(pdfParser.getRawTextContent()); // Get only the raw text
                });

                pdfParser.parseBuffer(Buffer.from(buffer)); // Pass the Buffer
            });
        });

        const result = await step.ai.infer("create-ai-summary", {
            model: step.ai.models.gemini({
                model: "gemini-2.0-flash",
                apiKey: env.GEMINI_API_KEY,
            }),
            body: {
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `Summarize the following resume and extract all key skills, experience, and qualifications. 
    The summary should include all the information that a hiring manager would need to know about the candidate in order to determine if they are a good fit for a job. 
    This summary should be formatted as markdown. Do not return any other text. If the text does not look like a resume return the text 'N/A'.\n\n${resumeText}`,
                            },
                        ],
                    },
                ],
            },
        });

        await step.run("save-ai-summary", async () => {
            const candidate = result?.candidates?.[0];
            const part = candidate?.content?.parts?.[0];

            if (!part || typeof part !== "object" || !("text" in part)) {
                console.log("No text part found in Gemini response");
                return;
            }

            await updateUserResume(userId, { aiSummary: part.text });
        });
    }
)