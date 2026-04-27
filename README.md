# SkillTrack - OHSU Collab
CS Senior Capstone Project

SkillTrack is a cross-platform (iOS and Android) mobile application designed to help nursing students and instructors easily evaluate and track their learned nursing skills.

Team Roster  
Elizabeth Stahlke - stahlkee@oregonstate.edu  
Antonio Rodriguez - rodriant@oregonstate.edu  
Russell Hueso - huesor@oregonstate.edu  
Aaron Pina-Ramirez - pinarama@oregonstate.edu  
Benjamin Kono - konob@oregonstate.edu





# How to Access or Try It
We make the code fully available in this repository for you to run your own instance of the app and create your own derived work based on this app if you wish.

To run this application distict elements you must know about the **backend** and the **frontend**. You need the backend in order for the frontend to work. Follow the instructions to get your own instance of SkillTrack running!

Before you continue these steps clone this reposity to your local development enviornment. We have had some issues with paths being too long in the past, so we recommend cloning the repo as close your root directyry as possible, So on windows clone it to C:\<CLONED-REPO>, or if you have additional drives on your computer you can clone them to the root of that drive instead too. ie. D:\<CLONED-REPO>

## Setting Up the Backend
The backend for this application is fully managed on Amazon Web Services (AWS). You will need an AWS account. You can create one here: https://aws.amazon.com/.
We highly recommend creating a admin IAM user to do the majority of operations from here on out rather than directly using the root account. Please read this article on how to do that https://docs.aws.amazon.com/streams/latest/dev/setting-up.html 

After you are logged in to your administative user account that you just created(rather than as the root user). Go to the top right of the screen and select the security credentials option.
<img width="940" height="575" alt="image" src="https://github.com/user-attachments/assets/f4a20c15-70f4-40d8-8bee-df3a1e45f6b2" />
You will be brought to a new screen. On this new screen scroll to the access keys submenu and press the _Create access_ key button and select the _Command Line Interface (CLI)_ option. Go through the process of making the key. When you reach the _Retrieve access keys_ menu STOP here for now. And keep this window open for now, you will need these key values soon.

Next you will need to install AWS and SAM CLI. Follow these two links to install those two:
* https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
* https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html






**Extra Notes** (read this if you would like more in depth understanding of how the backend works. If you only want to setup the backend you can just skip this section.) 

## Setting Up the Frontend

## Putting It All Together
