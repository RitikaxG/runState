import {z} from "zod";

export const signupSchema = z.object({
    email : z.string().min(3).max(30).email({message : "Invalid email format"}),
    password : z.string().min(8).max(32)
                    .refine((password) => /[A-Z]/.test(password), {
                        message : "Must have atleast one uppercase letter"
                    })
                    .refine((password) => /[a-z]/.test(password),{
                        message : "Must have atleast one lowercase letter"
                    })
                    .refine((password) => /[0-9]/.test(password),{
                        message : "Must have atleast one digit"
                    })
                    .refine((password) => /[!@#$%^&*]/.test(password),{
                        message : "Must have atleast one special character"
                    })
})

export const signinSchema = z.object({
    email : z.string().email(),
    password : z.string().min(1,{ message : "Password cannot be empty"})
})