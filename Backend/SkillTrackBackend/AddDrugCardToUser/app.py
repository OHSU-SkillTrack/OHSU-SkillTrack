'''
/AddDrugCardToUser

although intended for students to call. There is no problem with admins and 
teachers calling it too.

'''


import json
import os
import boto3
import time

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])


GlobalHeaders ={"Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "POST,OPTIONS"}



def add_drug_card_to_user(event, context):

    input_body = json.loads(event["body"])

    claims = event["requestContext"]["authorizer"]["claims"]
    calling_user_email = claims["email"]

    statusCode = 0
    output_body = ""



    #check to make sure all required inputs are in place
    try:
        CardID = input_body.get("CardID")

        if CardID is None:
            CardID = int(time.time() * 1000)
        else:
            CardID = int(CardID)


        #now we extract each particular input from the 
            

    except:
        statusCode = 400
        output_body = "error: The body of your request is formatted incorrectly"

        return{
            "statusCode": statusCode,
            "headers": GlobalHeaders,
            "body": json.dumps(output_body)
        }


    
    #If there is currently no resources row for this user go ahead and make it.
    try:
        newUserResourceRow = {
            "ID" : "USER_RESOURCES_FOR#" + calling_user_email,
            "DrugCards": {}
        }

        table.put_item( Item = newUserResourceRow, ConditionExpression = "attribute_not_exists(ID)" )

    except:
        print("row already exist, continue execution")

    






    statusCode = 200
    output_body = output_body +  " " +  str(CardID)

    return{
        "statusCode": statusCode,
        "headers": GlobalHeaders,       
        "body": json.dumps(output_body)

    }


