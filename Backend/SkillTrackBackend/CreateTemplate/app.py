
'''

/CreateTemplate

We will use this to make a new template!
'''

import json
import os
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])


GlobalHeaders ={"Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "POST,OPTIONS"}





def create_template(event, context):

    input_body = json.loads(event["body"])

    claims = event["requestContext"]["authorizer"]["claims"]
    calling_user_email = claims.get("email")

    statusCode = 0
    output_body =       ""

    try:
        #first we verify if the calling user has the admin role 
        caller_user_row =  table.get_item(Key= {"ID": "USER#" + calling_user_email}).get("Item")
        user_roles = caller_user_row.get("Roles", [])

        if not ("Admin" in user_roles):
            statusCode = 403
            output_body = "Error: You do not have permission to view template details"
            return{
                "statusCode": statusCode,
                "headers": GlobalHeaders,       
                "body": json.dumps(output_body)
            }
    except Exception as e:
        statusCode = 500
        output_body = "Error reading data from the table. Ended with this error: " + str(e)
        return{
                "statusCode": statusCode,
                "headers": GlobalHeaders,       
                "body": json.dumps(output_body)
            }

    

    #now we will try to extract the input values
    try:

        #we should now have a list 
        templateName = input_body["Name"]
        templateID = input_body["ID"]
        
        #it's ok to make a template with no skills for now, which is why we use get 
        skills = input_body.get("Skills", [])

        
        for skill in skills:
            if not isinstance(skill, dict):
                raise ValueError("each skill must be on object")
            if "Name" not in skill or "Description" not in skill:
                raise ValueError("skill missing required fields")
        
        statusCode = 201
        output_body = "successfully created template"
            

    except:
        statusCode = 400
        output_body = "error: The body of your request is formatted incorrectly"

        return{
            "statusCode": statusCode,
            "headers": GlobalHeaders,
            "body": json.dumps(output_body)
        }


    try:

        #first create the row
        newTemplateRowItem = {
            "ID" : "COURSE_TEMPLATE#" + templateID,
            "CourseName" : templateName, 
            "Skills": {}
        }

        

        for skill in skills:
            new_skill_name = skill["Name"]
            if new_skill_name in newTemplateRowItem["Skills"]:
                raise ValueError(f"Duplicate skill name detected: '{new_skill_name}'")

            newTemplateRowItem["Skills"][new_skill_name] = {
                "Description": skill["Description"]
            }

        
        table.put_item(Item = newTemplateRowItem)







    except Exception as e:
        
        statusCode = 500
        output_body = "error: error in creating template, templete attempt deleted.  Ended with this error: " + str(e)
        return{
            "statusCode": statusCode,
            "headers": GlobalHeaders,
            "body": json.dumps(output_body)
        }



    return{
        "statusCode": statusCode,
        "headers": GlobalHeaders,       
        "body": json.dumps(output_body)
    }

