'''
/GetUsersDrugCardList
'''

import json
import os
import boto3
import time

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])


GlobalHeaders ={"Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,OPTIONS"}


def get_users_drug_card_list(event, context):

    claims = event["requestContext"]["authorizer"]["claims"]
    calling_user_email = claims["email"]

    statusCode = 0
    output_body = ""

    #Fetch resource row and extract drug card listings.
    try:

        resource_row = table.get_item(Key={'ID': f'USER_RESOURCES_FOR#{calling_user_email}'}).get("Item")

        drugCardData = resource_row['DrugCards']
        statusCode = 200
        output_body = drugCardData
    except:
        statusCode = 404
        output_body = "Drug Cards data for this user not found."


    return {
        "statusCode": statusCode,
        "headers": GlobalHeaders,       
        "body": json.dumps(output_body)
    }