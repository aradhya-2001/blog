//jshint esversion:6

const exp = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const app = exp();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(exp.static("public"));

var posts = [];

app.get("/", (req, res) => {
  res.render("home", {
    postContent: posts,
    _: _,
  }); /* here full lodlash(_) is exported as _  */
});

app.get("/about", (req, res) => {
  res.render("about");
});
app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/compose", (req, res) => {
  res.render("compose");
});

app.post("/compose", (req, res) => {
  const post = {
    title: req.body.title,
    content: req.body.content,
  };
  posts.push(post);
  res.redirect("/compose");
});

app.post("/contact", (req, res) => {
  let data = req.body;
  console.log(data.email)
  console.log(data);

  const client_id =
    "430658692390-ctdlh2bsfjtlhscafpc3q8g5nc0co16o.apps.googleusercontent.com";
  const client_secret = "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";
  const redirect_url = "https://developers.google.com/oauthplayground";
  const refrsh_token =
    "1//04qgxMWeUXT8ECgYIARAAGAQSNwF-L9IriKsq1PXP8rD9it0nFLunetCZ1IJgMMJpWaQlD5PBcE-jpXAACB_0ts1QuJZ9XZktihE";
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_url
  );
  oAuth2Client.setCredentials({ refresh_token: refrsh_token });

  async function sendMail() {
    try {
      const access_token = await oAuth2Client.getAccessToken();

      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: "singh.aradhya2019@gmail.com",
          clientId: client_id,
          clientSecret: client_secret,
          refreshToken: refrsh_token,
          accessToken: access_token,
        },
      });

      const mail_options = {
        from: `${data.name} 📧 <${data.email}>`,
        /* on opening gmail data.email should give the email addrs enetred but its giving my address..dk why? */
        to: "singh.aradhya2019@gmail.com",
        subject: data.subject,
        //text: data.body,
        html: `<p>${data.body}</p>`,
      };

      const result = await transport.sendMail(mail_options);
      return result;
    } catch (err) {
      return err;
    }
  }

  sendMail()
    .then((messg) => {
      res.redirect("/contact")
      }).catch((err) => {
      console.log(err.message);
    });
    /* res.redirect("/contact") */
    //res.render("contact",{bottom:"email has been sent successfully"})
});

app.get("/:topic", (req, res) => {
  let cnt = 0; /* this is to keep track when the title is found */
  let i = 0; /* i is declared outside so to find the title and body below the for loop */
  let a = _.lowerCase(req.params.topic);
  for (; i < posts.length; i++) {
    if (a === _.lowerCase(posts[i].title)) {
      cnt++;
      if (cnt === 1) break;
      /* when can enter many contents with same title or a title can be entered in our site many times. When we found the first occurance our our title then loop breaks   */
    }
  }
  if (cnt === 0) {
    res.render("post", { pTitle: "Try Again!", pBody: "Title not found" });
    /* console.log("Not found"); */
  } else {
    res.render("post", { pTitle: posts[i].title, pBody: posts[i].content });
   /*  console.log("Found"); */
  }
});

app.listen( process.env.PORT || 3000, function () {
  console.log("Server started");
});
