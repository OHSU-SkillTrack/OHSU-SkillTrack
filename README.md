# SkillTrack - OHSU Collab
CS Senior Capstone Project

SkillTrack is a cross-platform (iOS and Android) mobile application designed to help nursing students and instructors easily evaluate and track their learned nursing skills.

Team Roster  
Elizabeth Stahlke - stahlkee@oregonstate.edu  
Antonio Rodriguez - rodriant@oregonstate.edu  
Russell Hueso - huesor@oregonstate.edu  
Aaron Pina - pinarama@oregonstate.edu  
Benjamin Kono - konob@oregonstate.edu





# How to Access or Try It
We make the code fully available in this repository for you to run your own instance of the app and create your own derived work based on this app if you wish.

To run this application distict elements you must know about the **backend** and the **frontend**. You need the backend in order for the frontend to work. Follow the instructions to get your own instance of SkillTrack running! We recommend you read through all the instructions before you begin the set up process yourself.

Before you continue these steps clone this reposity to your local development enviornment. We have had some issues with paths being too long in the past, so we recommend cloning the repo as close your root directyry as possible, So on windows clone it to C:\<CLONED-REPO>, or if you have additional drives on your computer you can clone them to the root of that drive instead too. ie. D:\<CLONED-REPO>

If somebody else has already set up an instance of the Backend for you and you just want to locally test the frontend, you can skip to the Setting Up the Frontend section

## Setting Up the Backend

### Setting up prerequisites
The backend for this application is fully managed on Amazon Web Services (AWS). You will need an AWS account. You can create one here: https://aws.amazon.com/.
We highly recommend creating a admin IAM user to do the majority of operations from here on out rather than directly using the root account. Please read this article on how to do that https://docs.aws.amazon.com/streams/latest/dev/setting-up.html 

After you are logged in to your administative user account that you just created(rather than as the root user). Go to the top right of the screen and select the security credentials option.
<img width="940" height="575" alt="image" src="https://github.com/user-attachments/assets/f4a20c15-70f4-40d8-8bee-df3a1e45f6b2" />
You will be brought to a new screen. On this new screen scroll to the access keys submenu and press the _Create access_ key button and select the _Command Line Interface (CLI)_ option. Go through the process of making the key. When you reach the _Retrieve access keys_ menu STOP here for now. And keep this window open for now, you will need these key values soon.

Next you will need to install AWS and SAM CLI. Follow these two links to install those two:
* https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
* https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

You may need to restart your computer after installing these to ensure they are fully installed, we recommend doing it regardless just for good measure.

Now open a command terminal of your choice on your computer and enter the command _aws configure_. You will be prompted for an **Access Key ID** and a **Secret Access Key** these are the values from the earlier tab you should still have open. Bring that tab back and copy and paste those values into the command terminal as the prompts ask you for them. You may be asked for other information as well such as a default region. You may select a default region, the main thing is to be consistant int terms of what region you will want to preform actions in. _us-east-2_ and _us-east-1_ for example are popular regions.
Please note that the Access Key and Secret Key **must be kept secret**. They provide the same account access that being logged into the AWS website would. Never put these keys into a shared environment such as a code repository (especially a public code repository) or a shared google doc for example. As a general security principle we also recommend deleting and regenerating the keys every once in a while (rotating them). We also recommend only having the key active when you are actively developing code(or launching the backend for the first time, as we are doing now). You can otherwise deactivate the key in the same Security Credentials menu if you think you'll need it at soon, or delete it outright if you won't be doing any re-deployments/code development anytime soon.

You have all the prerequisites in place now, nice job! Now we can move on to deploying the backend.

### Deploying the backend (The fun part)
On your command line interface, navigate to the location where you have this repository located. Then further go in with the cd command until you are in the OHSU-SkillTrack/Backend/SkillTrackBackend folder. You should see something like this:
<img width="1030" height="124" alt="image" src="https://github.com/user-attachments/assets/53374b72-c4ef-48b5-9e82-08647feb1a4a" />
you will now run two commands in this order:
* _sam build_
* _sam deploy_
  * You may instead run _sam deploy guided_ if you would like to customize certain aspects such as the name of the stack that will be deployed on AWS (it will default to SkillTrackBackend if you don't change this) or the AWS region it is deployed to. (it will default to us-east-2).

Follow the on screen prompt, you may have to allow it to create a bucket to upload the files we are trying to deploy. If everything goes correctly you will have sucessfully deployed the backend. Good job!
Note that if you decide you want to make changes to the backend code yourself, to deploy changes you will need to run **sam build** first, and then **sam deploy**, each time

If you **at any moment** want to take the backend down you can very quickly do it by running this command: 
* sam delete --stack-name "skilltrackbackend". 

If you prefer the website UI interface you can also do it there. Follow the instructions here to do that:
* https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-console-delete-stack.html


If everything worked you can now skip to the Frontend Section, or you may scroll down to the optional readings if you would like to know some more about how the backend works behind the scenes.

⚠️ Potential issue: You must have python installed. If you don't you may have an error. It must also be version 3.13 (newer version may work, but we are certain that 3.13 does work). If you arleady have python installed and you are on windows, ensure that in your system Envionment variables python is in the path. You should see something like this:

<img width="450" alt="image" src="https://github.com/user-attachments/assets/ce44cac6-0922-40be-807a-13dbff7f971b" />
<br>
<img width="450"  alt="image" src="https://github.com/user-attachments/assets/2ea8048c-c633-497a-bb47-078acba0c5c8" />
<br>
<img width="450" alt="image" src="https://github.com/user-attachments/assets/2bbd2566-3ab5-4a96-8f49-c5c5d2184685" />
<br>
<img width="450" alt="image" src="https://github.com/user-attachments/assets/821bf02b-4a7d-4391-a141-9834920d258f" />
<br>
Ensure these two red circled lines are there. If you do not one or both, you can manually add it by pressing the new button. You will have to find the python installation location on your computer to do this.










### Optional Reading
(read this if you would like more in depth understanding of how the backend works, for example if you want to modify the backend code yourself. If you only want to deploy the backend you can just skip this section.) 

The most imporant file in the backend is the template.yaml file in OHSU-SkillTrack/Backend/SkillTrackBackend. This file fundamentally described all resources we are deploying onto AWS every time we run _sam build_ and _sam deploy_. The basic structure is a Gateway+Lambda combination for the API endpoint creation. And each Gateway endpoint is password protected by AWS Cognito (view the architecture document also in this repo for more information). The main modifications you may be interested in making are creating new endpoints or renaming the Cognito User Pool and Client (they are called MyUserPool and MuUserPoolClient which are a bit generic, and you can feel free to change them if you'd like). For creating new endpoints we generally recommend following the format of the other endpoints that are already there in the ENDPOINT DEFINITION SECTION. When messing with this file the most important thing to be mindful of is to not accidentaly remove the Auth Section of the API definition at the top. This ensures that the API endpoints are protected and only authorized users can call them.

Finally it is HIGHLY recommended you go to the AWS Console website and go to: API Gateway > APIs > SkillTrackBackend > Stages and ensure CloudWatch logs are active. You may have to turn this on manually, and it usually disables itself everytime you redeploy the backend. This ensures you can diagnose any problems if you discover them.
<img width="1915" height="870" alt="image" src="https://github.com/user-attachments/assets/75ab378e-7534-4bca-9048-3422e6e512be" />



## Setting Up the Frontend

## Putting It All Together
