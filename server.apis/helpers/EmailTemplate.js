
import { sender_email } from "../config/aws.js";

const EmailTemplate = (receiver_email,subject,body) => {
        return{
          Source: sender_email,
          Destination:{ToAddresses:[receiver_email]},
          Message:{
            Subject:{
                 Charset:"UTF-8",
                 Data:`Electro - Samam - ${subject}`
            },
            Body: {
                 Html: {
                 Charset:"UTF-8",
                 Data:`
                 <html>
                    <body>
                        <h1> We are Electro Saman Store </h1>
                         ${body}
                        <h3> regards:
                           Thank you
                        </h3>
                    </body>
                 </html>
                 `
            }
          }
          }
        }  
}

 export default EmailTemplate;
