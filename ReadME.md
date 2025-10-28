    
1) User Signup
http://localhost:5000/api/v1/auth/register/user

2) Pro Signup
http://localhost:5000/api/v1/auth/register/pro

3) User and Pro login
http://localhost:5000/api/v1/auth/userlogin

4) User and Pro logOut
id ==> token document user id
http://localhost:5000/api/v1/auth//logout/:id

5) User and Pro Forget Password
http://localhost:5000/api/v1/auth/forgetpassword

6) User and Pro Send OTP (
//----------User and Pro forgot Password Send OTP--------------------//)
http://localhost:5000/api/v1/auth/sendotp

7) User and Pro Verify OTP
http://localhost:5000/api/v1/auth/verifyotp

8) User and Pro ReSend OTP
http://localhost:5000/api/v1/auth/resendotp



http://localhost:5000/api/v1/pro/home ==> update dekhnii hian kl

backend server ip ==> http://3.110.42.187:5000

db error ==> 401
vadioaion error ==> 400
catch ==> 400
success == >200
created ==> 200


///ask the theo/////
jb a=hum koi service lete hai is mein end time nhi btate ktni derh ke service pro de ga inchat,virtual,inperson

booking
bookingRatings
bookingQuotes
bookingPayment
bookingStatus
bookingTimeline

Request Sent,Cancelled By Customer,Confirmed by Customer,Cancelled By Professional

////////ER DIAGRAM///
https://dbdiagram.io/d


user ==>book service ==> Pending ==>  
pro ==>get service ==> Pending ==>


one to many


login pro ==>get service ==> Pending==>    

login user ==>get service ==> Pending ==>

pro accept ==> Accepted

user get quote ==> proBookservices Accpeted

user confirm booking service ==>  proBookservices and userBookService ==> onGoing
   

----Add service pro API--
ADD _ID PRO    


------admin panel ip---
http://13.126.40.123:5000/



--------------Email--------------------


1) jb background verify hojye email krni
2) jb pro register hojye tb email
3) jb user register hojye tb email
4) otp verify hoga tb email ajyegi for pro and user.

email:
otp email = done
jb pro register hojye tb email ("/api/v1/pro/profile/update") =done
jb pro ki payment success hojye, ya fail hojye registration k time,(paypal,stripe dono sy).
Repeated multiple invalid login attempts. It blocked user for 30mins. = done




//////stripe video ////
https://www.youtube.com/watch?v=SY9ekpkcgTI


///paypal////
https://www.youtube.com/watch?v=QbdDg8wgBYg&t=2950s



import {
  insertNewDocument,
  updateDocument,
  find,
} from "../../../../helpers/index.js";

// const onlineUsers = new Map();

const handleSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("[Socket] New connection on /api/socket:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      // onlineUsers.set(userId, socket.id);
      console.log(User ${userId} joined socket);
    });

    socket.on(
      "send_message",
      async ({
        chatId,
        senderId,
        receiverId,
        message,
        role,
        userBooking,
        proBooking,
        isBooking,
      }) => {
        try {
          if (isBooking) {
            if (role === "user") {
              const findUserChat = await find("chatMessage", {
                role: "user",
                chatId,
                userBooking,
                proBooking,
              });

              if (findUserChat.length === 4) {
                socket.emit("chat_warning", {
                  status: "warning",
                  message:
                    "Reminder: You’ve used 4 messages out of your 7-message limit. Extend your chat now to continue beyond 7.",
                });
              }
              if (findUserChat.length >= 7) {
                socket.emit("chat_error", {
                  status: "error",
                  message: "User chat limit exceeded",
                });
                return;
              }
            }

            if (role === "pro") {
              const findProChat = await find("chatMessage", {
                role: "pro",
                chatId,
                userBooking,
                proBooking,
              });

              if (findProChat.length === 4) {
                socket.emit("chat_warning", {
                  status: "warning",
                  message:
                    "Reminder: You’ve used 4 messages out of your 7-message limit. Extend your chat now to continue beyond 7.",
                });
              }
              if (findProChat.length >= 7) {
                socket.emit("chat_error", {
                  status: "error",
                  message: "Pro chat limit exceeded",
                });
                return;
              }
            }
          }

          console.log(
            chatId,
            senderId,
            receiverId,
            message,
            "chatId, senderId, receiverId, message"
          );

          const newMessage = await insertNewDocument("chatMessage", {
            chatId,
            senderId,
            receiverId,
            message,
            role,
            userBooking,
            proBooking,
            isBooking,
          });

          console.log(newMessage, "messagenew");
          console.log(senderId, "send");
          console.log(receiverId, "reciever");

          // emit message to chat room
          io.to("chatRoom").emit("message_sent", newMessage);
          io.to("chatRoom").emit("receive_message", newMessage);
        } catch (err) {
          socket.emit("chat_error", {
            status: "error",
            message: "An unexpected error occurred",
            error: err.message,
          });
        }
      }
    );

    console.log("final");

    // socket.on("disconnect", () => {
    //   for (let [userId, socketId] of onlineUsers.entries()) {
    //     if (socketId === socket.id) {
    //       onlineUsers.delete(userId);
    //       break;
    //     }
    //   }
    //   console.log("[Socket] Disconnected:", socket.id);
    // });
  });
};

export default handleSocket;