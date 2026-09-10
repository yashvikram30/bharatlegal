import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";


export async function POST(request: NextRequest){
    await dbConnect();

    try {
        const { username, email, password } = await request.json();

        if (!username || !email || !password) {
            return Response.json(
                { success: false, message: "Please provide username, email, and password" },
                { status: 400 }
            );
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim();

        const existingUserByUsername = await UserModel.findOne({
            username: { $regex: new RegExp(`^${cleanUsername}$`, "i") },
        });

        if (existingUserByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken",
                },
                { status: 400 }
            );
        }

        const existingUserByEmail = await UserModel.findOne({ email: cleanEmail });
        if (existingUserByEmail) {
            return Response.json(
                {
                    success: false,
                    message: "User already exists with this email! Try another",
                },
                { status: 400 }
            );
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new UserModel({
                username: cleanUsername,
                email: cleanEmail,
                password: hashedPassword,
            });
            await newUser.save();
            return Response.json(
                {
                    success: true,
                    message: "User registered successfully!",
                },
                { status: 201 }
            );
        }
        
    } catch (error) {
        console.error("Error registering user: ",error);
           return Response.json({
            success: false,
            message: "Error registeristing user",
        },
    {
        status: 500
    })
        
    }
}