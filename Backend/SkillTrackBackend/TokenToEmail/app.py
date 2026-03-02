import json
import os
import boto3
import secrets
import time 
dynamodb = boto3.resource("dynamodb")
token_table = dynamodb.Table(os.environ["TOKEN_TABLE_NAME"])
table = dynamodb.Table(os.environ["TABLE_NAME"])


GlobalHeaders ={"Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,OPTIONS"}



def token_to_email(event, context):
    claims = event["requestContext"]["authorizer"]["claims"]
    calling_user_email = claims.get("email")
    
    statusCode = 0
    body =       ""
    
    #verify the call is correctly formatted
    try:
        token_to_translate = event["queryStringParameters"]["Token"]
    except:
        statusCode = 400
        output_body = "Incorrectly formatted API call"
        return {
            "statusCode": statusCode,
            "headers": GlobalHeaders,       
            "body": json.dumps(output_body)
    }

    #verify the calling user is a teacher or admin
    try:
        caller_user_row =  table.get_item(Key= {"ID": "USER#" + calling_user_email}).get("Item")
        user_roles = caller_user_row.get("Roles", [])

        if not ("Admin" in user_roles) and not ("Teacher" in user_roles):
            statusCode = 403
            output_body = "Error: You do not have permission to view class details"
            return{
                "statusCode": statusCode,
                "headers": GlobalHeaders,       
                "body": json.dumps(output_body)
            }
        
        #if reach this line, then we are good to to obtain the table information
        fetched_user_info =token_table.get_item(Key={"Token": token_to_translate}).get("Item")
        user_id = fetched_user_info["ID"]
        user_id = user_id.removeprefix("USER#")
        statusCode= 200


    
    except Exception as e:
        statusCode = 500
        output_body = "Error reading data from the database. Ended with this error: " + str(e)
        return{
            "statusCode": statusCode,
            "headers": GlobalHeaders,       
            "body": json.dumps(output_body)
        }

    return{
        "statusCode": statusCode,
        "headers": GlobalHeaders,       
        "body": json.dumps({"ID": user_id})
    }




