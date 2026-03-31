'''
/CreateCourseFromTemplate 
This code takes a course template and converts it into a actual teachable course, the calling user is assigned as the teacher for this course.

POST request.
Required Inputs:
Template_ID - The ID of a template in the database as a string.

'''


#This both creates user table and modifies teacher table, in the event the first suceeds but seconds fail it may
#be worth to do a rollback, so we dont have a mismatch situation. But that is not currently implemented 

import json
import os
import boto3
import random
from datetime import datetime   #useful for generating the courseID 

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])

GlobalHeaders ={"Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,OPTIONS"}


#Helper Function
def has_AdminPermission(emailOfUserThatCalledThisEndpoint):
    
    response = table.get_item(
        Key= {
            "ID": "USER#" + emailOfUserThatCalledThisEndpoint
        }
    )
        
    calling_user_info = response.get("Item")
    roles = calling_user_info.get("Roles", [])

    if "Admin" not in roles:
        return False
    else:
        return True

    return False

#Helper Function
def has_teacherPermission(emailOfUserThatCalledThisEndpoint):

    response = table.get_item(
        Key= {
            "ID": "USER#" + emailOfUserThatCalledThisEndpoint
        }
    )
        
    calling_user_info = response.get("Item")
    roles = calling_user_info.get("Roles", [])

    if "Teacher" not in roles:
        return False
    else:
        return True

    return False



#Main Function
def create_course_from_template(event, context):

    input_body = json.loads(event["body"])

    claims = event["requestContext"]["authorizer"]["claims"]
    email = claims.get("email")

    statusCode = 0
    output_body =       ""

    hasAdminPermissionBool =   has_AdminPermission(email)
    hasTeacherPermissionBool = has_teacherPermission(email)

    #Check if the calling user is either a admin or a teacher. If not, don't allow them to make a course.
    if(hasAdminPermissionBool == False and hasTeacherPermissionBool == False):
        statusCode = 403
        output_body = "error: you do not have permission to make a course from a template"
        return{
            "statusCode": statusCode,
            "headers": GlobalHeaders,
            "body": json.dumps(output_body)
        }
    

    #try to extract the template ID from the request body, if it's not there, return an error
    template_ID = ""
    try:
        template_ID = input_body["Template_ID"]
    except:
        statusCode = 400
        output_body = "error: The body of your request is formatted incorrectly"

        return{
            "statusCode": statusCode,
            "headers": GlobalHeaders,
            "body": json.dumps(output_body)
        }


    #We try to extract the data of the course template 
    course_template = ""
    try: 
        #first we try obtaining the template that was requested
        course_template_res = table.get_item(
            Key = {
                "ID": "COURSE_TEMPLATE#" + template_ID
            }
        )
        course_template = course_template_res.get("Item")

    except Exception as e:
        #If the template was not found, throw this exception and return
        statusCode = 500
        return{
            "statusCode": statusCode,
            "headers": GlobalHeaders,
            "body":  json.dumps({"error": str(e)})
        }
    
    if not course_template:
        return {
            "statusCode": 404,
            "headers": GlobalHeaders,
            "body": json.dumps({"error": "Failed to find request template"})
        }



    #with us now having the course template we can work to extract the values from it to make our course!
    #This block generated the course 
    generated_course_id = template_ID + "-" + str(datetime.now().year)
    course_row_to_insert = {
        "ID": "COURSE#" + generated_course_id,          #courseID with unique extra tag at end (currently just the current year, may modify later)
        "CourseName": course_template["CourseName"],    #extracted from template
        "Skills": course_template["Skills"] ,           #extracted from template
        "Teachers" :{email}                             #calling user assigned as teacher
    }

    #now that object has been made, try to insert it into the table as a new course
    try:

        #try to make the course, first try to make it without any modifiers, just the base ID and year.
        try:
            table.put_item(Item = course_row_to_insert, ConditionExpression="attribute_not_exists(ID)")
            statusCode = 201
            body = "successfully created course"
        #If that fails we will try creating a unique number digit to append. It will be monthInt+dayInt+randInt where the random int is anything between 0 to 999.
        #This way any possible colissions that occur would only occur if the course is made on the same day and the chances of a collision are very low, unless something like 100 courses
        #are made in one day for some reason, the probability of another colision will remain well under 10% for each attempt.
        except:
            generated_course_id = template_ID + "-" + str(datetime.now().year) + "_" + str(datetime.now().month) + str(datetime.now().day) + str(random.randint(0,999))
            course_row_to_insert["ID"] =  "COURSE#" + generated_course_id
            table.put_item(Item = course_row_to_insert, ConditionExpression="attribute_not_exists(ID)")
            body = "successfully created course"
            statusCode = 201
    except:
       statusCode = 409
       body = "Error occured with course generation, please try again"
       return {
            "statusCode": statusCode,
            "headers": GlobalHeaders,       
            "body": json.dumps(body)
        }

    #Finally, one last touch, the courses that a teacher is teaching is also tracked in their individual user row for easy access, so that into the TeachingThese Courses column
    try:
        table.update_item(
            Key={
                "ID": f"USER#{email}"
            },
            UpdateExpression="ADD TeachingTheseCourses :new",
            ExpressionAttributeValues={
                ":new": {generated_course_id} 
            },
            ConditionExpression="attribute_exists(ID)"
        )
    except:
        statusCode = 500
        body = "failed to update teacher row with the course, but course row was created"

    return {
        "statusCode": statusCode,
        "headers": GlobalHeaders,       
        "body": json.dumps(body)
    }

    
