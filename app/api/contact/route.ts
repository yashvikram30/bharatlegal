import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import ContactMessageModel from "@/model/ContactMessage";
import nodemailer from "nodemailer";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address"),
  subject: z.string().min(2, "Subject must be at least 2 characters").max(150),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = contactSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.errors[0]?.message || "Invalid input data",
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parseResult.data;

    // 1. Persist to MongoDB if connected
    let messageRecord = null;
    try {
      if (process.env.MONGO_URL) {
        await dbConnect();
        messageRecord = await ContactMessageModel.create({
          name,
          email,
          subject,
          message,
          status: "new",
        });
      }
    } catch (dbErr) {
      console.warn("Could not persist contact message to database:", dbErr);
    }

    // 2. Dispatch email notification if SMTP credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"BharatLegal Feedback" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER,
          replyTo: email,
          subject: `[BharatLegal] ${subject} - from ${name}`,
          text: `New contact submission on BharatLegal:\n\nFrom: ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}`,
        });
      } catch (mailErr) {
        console.warn("Could not send email notification:", mailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your feedback has been received. Our team will review it promptly.",
        id: messageRecord?._id?.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process your request. Please try again later.",
      },
      { status: 500 }
    );
  }
}
