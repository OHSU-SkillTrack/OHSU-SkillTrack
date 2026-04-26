
'''

/CreateTemplate

We will use this to edite an existing template!
'''


import json
import os
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])


GlobalHeaders ={"Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "POST,OPTIONS"}


def edit_template(event, context):

    input_body = json.loads(event["body"])
    claims = event["requestContext"]["authorizer"]["claims"]
    calling_user_email = claims.get("email")



    try:
        #first we verify if the calling user has the admin role 
        caller_user_row =  table.get_item(Key= {"ID": "USER#" + calling_user_email}).get("Item")
        user_roles = caller_user_row.get("Roles", [])

        if not ("Admin" in user_roles):
            statusCode = 403
            output_body = "Error: You do not have permission to edit a template."
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


    #Verify to ensure all input values are accurate
    try:
        templateID = input_body["TemplateID"]
        
        actions = input_body.get("Actions" , [])

        actionsThatRequireContentField = ["addSkill", "editSkillName", "editSkillDescription"]

        for action in actions:
            
            #first test is to make sure that each action is indeed a dicionary object
            if not isinstance(action, dict):
                raise ValueError("Each action must be an object.")
            
            #next test is to ensure that the action field and target field are populated, each call will always at least have these two
            if "Action" not in action or "Target" not in action:
                raise ValueError("action missing required fields")
            
            #finally we will test for content field if it is one of the specified types
            if action["Action"] in actionsThatRequireContentField:
                if "Content" not in action:
                    raise ValueError("action missing required field")
            
    except:
        statusCode = 400
        output_body = "error: The body of your request is formatted incorrectly"

        return{
            "statusCode": statusCode,
            "headers": GlobalHeaders,
            "body": json.dumps(output_body)
        } 


    #First we try to obtain the row of the specified template ID
    try:
        templateRow = table.get_item(Key= {"ID": "COURSE_TEMPLATE#" + templateID})["Item"]


        #The general path we are going to follow will be something like templateRow[]


    except:
        statusCode = 404
        output_body = "error: course template not found"

        return{
            "statusCode": statusCode,
            "headers": GlobalHeaders,
            "body": json.dumps(output_body)
        } 



    #now we try the actions on this row
    actions = input_body.get("Actions" , [])
    #we will try to execute each action individually. 
    #If any individual action fails, we will continue and simply log the ones that were unsuccessful and return it in the response body.
    

    statusCode = 200
    output_body = "Success"

    failed_actions = []
    for action in actions:
        
        actionToPerform = action["Action"]
        target          = action["Target"]
        content         = action.get("Content", "")

        
        try:

            if actionToPerform == "deleteSkill":
                templateRow["Skills"].pop(target)
            elif actionToPerform == "editSkillDescription":
                
                #This line simply exists to trhow an error in case we do not have a valid target
                a = templateRow["Skills"][target]["Description"]
                
                #write the new description 
                templateRow["Skills"][target]["Description"] = content
            elif actionToPerform == "addSkill":

                # if already exists, DO NOT override, throw an error instead               
                existsAlready = templateRow["Skills"].get(target, None)
                if(existsAlready):
                    raise KeyError("A skill with this name already exists")
                
                #Now we will go ahead and inject the skill into the table
                templateRow["Skills"][target] = {
                    "Description": content
                }
            elif actionToPerform == "editSkillName":
                templateRow["Skills"][content]=  templateRow["Skills"].pop(target)

            
        except:
            failed_action_string = f" [failed the action: {actionToPerform}, On Target: {target}] "
            failed_actions.append(failed_action_string)
            statusCode = 500


    
    #finally try to put in the entire row we just made
    try:
        table.put_item(
            Item = templateRow,
            ConditionExpression="attribute_exists(ID)"
        )

    except Exception as e:
        statusCode = 500
        output_body = "error: failed to save changes, finished with this message: " + str(e)

        return{
            "statusCode": statusCode,
            "headers": GlobalHeaders,
            "body": json.dumps(output_body)
        } 


    if failed_actions:
        fail_string = "One or more operations failed, all others succeeded. Here is a list of the operatoins that failed:"
        for failure in failed_actions:
            fail_string += failure + " ; "
        output_body = fail_string





    return{
        "statusCode": statusCode,
        "headers": GlobalHeaders,       
        "body": json.dumps(output_body)
    }