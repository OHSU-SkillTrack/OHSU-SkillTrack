import json
import os
import boto3
import secrets
import time 
from boto3.dynamodb.conditions import Attr
dynamodb = boto3.resource("dynamodb")
token_table = dynamodb.Table(os.environ["TOKEN_TABLE_NAME"])


GlobalHeaders ={"Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,OPTIONS"}


def generate_token():
    return secrets.token_hex(16)

#This is the logic for the token table

def lambda_handler(event, context):
    claims = event["requestContext"]["authorizer"]["claims"]
    email = claims.get("email")
    
    statusCode = 0
    body =       ""    

    #Attempt to fetch row for the user that called this function
    try:
    # Fetch an item by primary key, the email
        
        token = generate_token()
            #tokens only good for 5 minutes
        expires_at = int(time.time() + 5 * 60)

            #add user token to table
        token_table.put_item(
                Item={
                    "Token": token,
                    "ID":"USER#" + email,
                    "ExpiresAt": expires_at,
                    "used": False
                }
            )
            
        statusCode = 200
        body = {"Token": token}

    #exception triggered, typically if our attempt to read from the databse goes wrong for some reason.
    except Exception as e:
        statusCode = 500
        body = "Error generating token or storing token. Ended with this error: " + str(e)
    


    #a bit of code just to clean up the table. It will read the entire table,
    #but each time a token is generated cleanup should happen, so it should not be too big a deal
    ##################################
    try:
        #Before returning, let's run some quick table cleanup and delete any rows that have expired
        expired_rows = token_table.scan(
                FilterExpression=Attr("ExpiresAt").lt(int(time.time()))

        )
        rows_to_delete = expired_rows['Items']
        with token_table.batch_writer() as batch:
            for item in rows_to_delete:
                batch.delete_item(
                    Key = {
                        'Token': item['Token']

                    }
                )
    except:
        print("failed to clean table, generating token anyways")
    ##################################

    #return code based on what happened.
    return {
        "statusCode": statusCode,
        "headers": GlobalHeaders,       
        "body": json.dumps(body)
    }



