import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

const client = new SmtpClient();

await client.connectTLS({
    hostname: "smtp.gmail.com",
    port: 587,
    username: "xxx@googlemail.com",
    password: "xxx",
  });
  
  await client.send({
    from: "elearningzone@googlemail.com", // Your Email address
    to: "keef-vp@hotmail.com", // Email address of the destination
    subject: "Mail Title",
    content: "Mail Content，maybe HTML",
  });
  
  await client.close();