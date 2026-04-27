# SkillTrack - OHSU Collab
CS Senior Capstone Project

SkillTrack is a cross-platform (iOS and Android) mobile application designed to help nursing students and instructors easily evaluate and track their learned nursing skills.

Team Roster  
Elizabeth Stahlke - stahlkee@oregonstate.edu - Front End Developer  
Antonio Rodriguez - rodriant@oregonstate.edu - Full Stack Developer  
Russell Hueso     - huesor@oregonstate.edu - Full Stack Developer  
Aaron Pina        - pinarama@oregonstate.edu - Back End Architect  
Benjamin Kono     - konob@oregonstate.edu - Front End Developer  

Feel free to contact any of us through the above emails with any questions or feedback! 😊

# Project Description and Value Proposition
**SkillTrack** is a mobile app designed for nursing students and instructors at OHSU to efficiently track, verify, and showcase learned clinical skills, replacing outdated paper checklists with a secure, organized, and accessible digital platform.

**The Problem:**  
Nursing programs often rely on paper-based systems to record student competencies, leading to lost records, inefficiency, and difficulty in quickly verifying which skills a student has mastered. This can delay clinical assignments and create uncertainty for both students and instructors.

**Our Solution:**  
SkillTrack streamlines skill tracking by providing a centralized, digital record accessible from any mobile device. Students can instantly view their progress, while instructors can verify and check off competencies in real time, even using QR codes for rapid validation. This ensures that everyone always knows which skills have been completed, improving safety and confidence in clinical settings.

**Why It Matters:**  
By eliminating paperwork and making skill records instantly available, SkillTrack saves time, reduces errors, and empowers students to take charge of their learning. Instructors benefit from simplified administration and more reliable data.

# Key Features or Highlights

## Students
- **Track skill progress**  
Students can view the courses they are currently enrolled in and see every required nursing skill for each course, including whether each skill has been approved or has yet to be completed.

- **Personal QR code for fast check off**  
Each student has a unique QR code on their profile page that instructors can scan to instantly access the student’s information and approve demonstrated skills.

- **Built-in drug information resources**  
Students can access a resources page containing drug reference information that was previously stored on paper flashcards, making drug information easier to organize and access.

## Instructors
- **Quick skill approvals with built-in camera**  
Instructors can use the in-app camera scanner to scan student QR codes, view relevant course information, and efficiently check off students' completed skills.

- **Manage courses and student progress**  
Instructors can view the courses they are teaching, see enrolled students, and monitor each student’s progress in one location.

- **Create courses from templates**  
Faculty members can create new course sections using predefined templates, reducing setup time and ensuring consistency across classes.

## Administrators
- **Manage course templates across the program**  
Administrators can create, edit, and maintain course templates that define required skills and skill details for OHSU nursing courses.

- **Student onboarding with CSV upload**  
Administrators can upload a CSV file of student information to automatically create accounts and pre-populate course enrollments and skill information.

## Video Demo
[Watch our demo](https://drive.google.com/file/d/1Y80GgYnAuw2M1uCTpafsPnMLDj5qolWM/view?usp=share_link)

## Gallary
Here are a few images of our app!

<img width="220" alt="image showing SkillTrack Welcome Page" src="https://github.com/user-attachments/assets/8d2c5a06-4cfe-4107-81c6-18038dca1b4a" />
<img width="220" alt="image showing the profile page of a student" src="https://github.com/user-attachments/assets/f624857f-2227-4eda-b61e-e438e3895625" />
<img width="220" alt="image showing the skill list for a particular class on the student view" src="https://github.com/user-attachments/assets/95e49318-81b3-4d68-96d9-2715ead01a42" />
<img width="220" alt="image showing camera view for a teacher checking a skill off" src="https://github.com/user-attachments/assets/157de8a9-705f-44a7-bbf1-533241649e23" />



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
<img width="500" alt="image highlighting how to get to the security credentials menu once logged into the AWS console" src="https://github.com/user-attachments/assets/f4a20c15-70f4-40d8-8bee-df3a1e45f6b2" />
You will be brought to a new screen. On this new screen scroll to the access keys submenu and press the _Create access_ key button and select the _Command Line Interface (CLI)_ option. Go through the process of making the key. When you reach the _Retrieve access keys_ menu STOP here for now. And keep this window open for now, you will need these key values soon.

Next you will need to install AWS and SAM CLI. Follow these two links to install those two:
* https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
* https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

You may need to restart your computer after installing these to ensure they are fully installed, we recommend doing it regardless just for good measure.

Now open a command terminal of your choice on your computer and enter the command `aws configure`. You will be prompted for an **Access Key ID** and a **Secret Access Key** these are the values from the earlier tab you should still have open. Bring that tab back and copy and paste those values into the command terminal as the prompts ask you for them. You may be asked for other information as well such as a default region. You may select a default region, the main thing is to be consistant int terms of what region you will want to preform actions in. _us-east-2_ and _us-east-1_ for example are popular regions.
Please note that the Access Key and Secret Key **must be kept secret**. They provide the same account access that being logged into the AWS website would. Never put these keys into a shared environment such as a code repository (especially a public code repository) or a shared google doc for example. As a general security principle we also recommend deleting and regenerating the keys every once in a while (rotating them). We also recommend only having the key active when you are actively developing code(or launching the backend for the first time, as we are doing now). You can otherwise deactivate the key in the same Security Credentials menu if you think you'll need it at soon, or delete it outright if you won't be doing any re-deployments/code development anytime soon.

You have all the prerequisites in place now, nice job! Now we can move on to deploying the backend.

### Deploying the backend (The Fun Part)
On your command line interface, navigate to the location where you have this repository located. Then further go in with the cd command until you are in the OHSU-SkillTrack/Backend/SkillTrackBackend folder. You should see something like this:

<img width="500" alt="image showing a command line terminal which is currently navigated into the SkillTrackBackend folder " src="https://github.com/user-attachments/assets/53374b72-c4ef-48b5-9e82-08647feb1a4a" />

you will now run two commands in this order:
* `sam build`
* `sam deploy`
  * You may instead run `sam deploy guided` if you would like to customize certain aspects such as the name of the stack that will be deployed on AWS (it will default to SkillTrackBackend if you don't change this) or the AWS region it is deployed to. (it will default to us-east-2).

Follow the on screen prompt, you may have to allow it to create a bucket to upload the files we are trying to deploy. If everything goes correctly you will have sucessfully deployed the backend. Good job!
Note that if you decide you want to make changes to the backend code yourself, to deploy changes you will need to run **sam build** first, and then **sam deploy**, each time

If you **at any moment** want to take the backend down you can very quickly do it by running this command: 
* `sam delete --stack-name "skilltrackbackend"`

If you prefer the website UI interface you can also do it there. Follow the instructions here to do that:
* https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-console-delete-stack.html


If everything worked you can now skip to the Frontend Section, or you may scroll down to the optional readings if you would like to know some more about how the backend works behind the scenes.

⚠️ Potential issue: You must have python installed. If you don't you may have an error. It must also be version 3.13 (newer version may work, but we are certain that 3.13 does work). If you arleady have python installed and you are on windows, ensure that in your system Envionment variables python is in the path. Follow along the windows menus with the below images:

<img width="500" alt="image showing the selection of the Edit the system environment variables menu on the Windows 11 search menu." src="https://github.com/user-attachments/assets/ce44cac6-0922-40be-807a-13dbff7f971b" />
<br>
<img width="500"  alt="image showing the system properties windows setting menu with the environment variables button highlighted" src="https://github.com/user-attachments/assets/2ea8048c-c633-497a-bb47-078acba0c5c8" />
<br>
<img width="500" alt="image showing the environment variables menu with the Path row highlighted" src="https://github.com/user-attachments/assets/2bbd2566-3ab5-4a96-8f49-c5c5d2184685" />
<br>
<img width="500" alt="image showing the two Python paths highlighted" src="https://github.com/user-attachments/assets/821bf02b-4a7d-4391-a141-9834920d258f" />
<br>
Ensure these two red circled lines are there. If you do not one or both, you can manually add it by pressing the new button. You will have to find the python installation location on your computer to do this.

### Optional Reading
(read this if you would like more in depth understanding of how the backend works, for example if you want to modify the backend code yourself. If you only want to deploy the backend you can just skip this section.) 

The most imporant file in the backend is the template.yaml file in OHSU-SkillTrack/Backend/SkillTrackBackend. This file fundamentally described all resources we are deploying onto AWS every time we run _sam build_ and _sam deploy_. The basic structure is a Gateway+Lambda combination for the API endpoint creation. And each Gateway endpoint is password protected by AWS Cognito (view the architecture document also in this repo for more information). The main modifications you may be interested in making are creating new endpoints or renaming the Cognito User Pool and Client (they are called MyUserPool and MuUserPoolClient which are a bit generic, and you can feel free to change them if you'd like). For creating new endpoints we generally recommend following the format of the other endpoints that are already there in the ENDPOINT DEFINITION SECTION. When messing with this file the most important thing to be mindful of is to not accidentaly remove the Auth Section of the API definition at the top. This ensures that the API endpoints are protected and only authorized users can call them.

Finally it is HIGHLY recommended you go to the AWS Console website and go to: API Gateway > APIs > SkillTrackBackend > Stages and ensure CloudWatch logs are active. You may have to turn this on manually, and it usually disables itself everytime you redeploy the backend. This ensures you can diagnose any problems if you discover them.
<img width="1915" alt="image showing the Cloudwatch logs turned on in the API Gateway settings" src="https://github.com/user-attachments/assets/75ab378e-7534-4bca-9048-3422e6e512be" />



## Setting Up the Frontend

### Setting up prerequisites
You will need to have nodejs installed on your computer, you can install it here.
* https://nodejs.org

There are two files you will need to add to your cloned repository.  

**First File** <br>
First login to the AWS console on the web again and go to API Gateway > APIs > SkillTrackBackend > Stages and locate the invoke URL. Copy this URL.

<img width="500" alt="image showing where to locate the Gateway invoke URL" src="https://github.com/user-attachments/assets/4be5695c-a2fe-4f15-a7d5-48e138f0988f" />

Next, find the location of the example-api.ts file: Frontend/SkillTrackFrontend/src/constants/example-api.ts
Create a copy of this file and place it in the same constants folder, but name this copy: api.ts.
Replace the https://example.com/api text with the URL you copied from the 
<br>
<br>


**Second File** <br>

In the OHSU-SkillTrack\Frontend\SkillTrackFrontend\src location, create a new file called amplifyconfiguration.json and paste in the following below code. We will now work on populating the TODO sections.
```
{
  "aws_project_region": "TODO",
  "aws_cognito_region": "TODO",
  "aws_user_pools_id": "TODO",
  "aws_user_pools_web_client_id": "TODO",
  "oauth": {
    "domain": "TODO"
  },
  "aws_cognito_username_attributes": [
    "EMAIL"
  ],
  "aws_cognito_social_providers": [],
  "aws_cognito_signup_attributes": [],
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_mfa_types": [],
  "aws_cognito_password_protection_settings": {
    "passwordPolicyMinLength": 8,
    "passwordPolicyCharacters": []
  },
  "aws_cognito_verification_mechanisms": []
}
```

Navigate to Amazon Cognito > User > MyUserPool > Overview (or if you renamed the user pool go to whatever you named it)
<img width="1307" alt="image showing where to find the Cognito User pool ID" src="https://github.com/user-attachments/assets/dc888dbd-59db-4429-a69a-b1b1723d43f0" />
Locate where the above image shows the green circle, where the User Pool ID is. Take the first part, what the region is and put that in the aws_project_region and aws_cognito_region. So it might be us-east2, or us-east1, or one of the other regions depending on what you have selected depending on what you have configured.

Next, for the aws_user_pools_id directly copy and past the full User pool ID from the above green circle.

Next you will fill in the aws_user_pools_web_client_id field. Go do the App clients tab and copy and paste the Client ID value. See the below image
<img width="1739" height="451" alt="image showing where to find the Cognito Client ID" src="https://github.com/user-attachments/assets/9eb0b5b0-4db8-4a5f-9d88-3e198fe98755" />

Finally, for the domain, go to the Domain tab under branding and copy and paste the domain value. You may have to create this if is not already there. 

Save changes in the file and you should be finished with this part!





### Launching the Frontend (The fun part)
Open a command terminal. On your command line interface, navigate to the location where you have this repository located. Then further go in with the cd command until you are in the OHSU-SkillTrack/Backend/SkillTrackFrontend folder. You should see something like this:

<img width="500"  alt="image showing the command terminal navigated to the SkillTrackFrontend folder location" src="https://github.com/user-attachments/assets/f2a23629-5326-49eb-9388-e476a0e7b1e5" />

Here, run the command: `npm i`

After that process finished you can run the command: `npx expo start`

The command line dialog should generate a url that looks something like this: http//localhost:8081.
You can open that URL in a web browser and you are in the app! This will let you view the app in the browser. This should work for initial viewing, but the app is optimized for mobile viewing. If you are satisfied with this browser view you can stop now. But if you would like to get the mobile view (we recommend using the mobile view if you are actually going to continue development of the app) read onwords:

You will need to prepare your **mobile testing** environment. Follow this link and select the particular enviornment you would like to develop code in: https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&platform=android&device=simulated&buildEnv=local
* The current pre selected options on the above link are for an android emulator running on Windows. But select which ever options you would like to work with. Please note that Development build **must** be one of the selected options. This will not work with Expo Go.

<img width="500"  alt="image showing to select Development Build and not Expo Go" src="https://github.com/user-attachments/assets/91b04530-93d9-474d-b8e5-2651515d65e2" />
<br>
<img width="500"  alt="image showing EAS mode toggled off" src="https://github.com/user-attachments/assets/88657544-b650-48a9-8248-c25145728672" />

We also recommend not doing it with the EAS build setting turned on unless you are currently seeking to deploy the app to the app stores.

Ensure that you select the operating system your computer is on if given the option to choose.
<img width="500"  alt="image highlighting the selection of a operating system" src="https://github.com/user-attachments/assets/6394f3a9-44a7-4117-b3bb-98f166896028" />

Once you have followed the steps from those instructions should be able to just run the app! For example to run it on an android emulator you would run the `npx expo run:android` command

