import React from "react";
import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData } from "react-router";
import { db } from "../database/db.server"; // Import Drizzle connection
import { Contact } from "../database/schema"; // Assuming User schema is set up in Drizzle

export default function pageContact() {
    const actionData = useActionData()
    console.log("From the use action hook: ", { actionData })
    return (
        <div>
            <h1>Contact Us</h1>
            <p>This is the Contact Us page of our Remix app!</p>

            <form method="post">
            <div>
                <label htmlFor="name">Name:</label>
                <input type="text" name="name" id="name" placeholder="Enter your name" required />
            </div>

            <div>
                <label htmlFor="email">Email:</label>
                <input type="email" name="email" id="email" placeholder="Enter your email" required />
            </div>

            <div>
                <label htmlFor="message">Message:</label>
                <textarea name="message" id="message" placeholder="Your message" required></textarea>
            </div>

            <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    const formName = formData.get("name") as string;
    const formEmail = formData.get("email") as string;
    const formMessage = formData.get("message") as string;

    if (!formName || !formEmail || !formMessage) {
        return { error: "All fields are required" };
    }

    try {
        await db.insert(Contact).values({
            name: formName,
            email: formEmail,
            message: formMessage,
          });
      
          console.log("Data inserted successfully:", {
            formName,
            formEmail,
            formMessage,
          });

        console.log("Data inserted successfully");
        console.log("Inserting data:", { formName, formEmail, formMessage });  
    } catch (error) {
        console.error("Error inserting data:", error);
    }

    //return { formName, formEmail, formMessage };

    return redirect('/');
}