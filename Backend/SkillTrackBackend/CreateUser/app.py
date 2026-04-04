import json
import os
import boto3


dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])

cognito = boto3.client("cognito-idp")
USER_POOL_ID = os.environ["USER_POOL_ID"]


GlobalHeaders ={"Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "POST,OPTIONS"}

def create_user(event, context):

    try:
        input_body = json.loads(event["body"])

        newUsers = input_body["NewUsers"]

        for user in newUsers:
            if not isinstance(user, dict):
                raise ValueError("each user must be an object")
            if "Email" not in user or "Password" not in user or "Role" not in user or "FirstName" not in user or "LastName" not in user:
                raise ValueError("user missing required fields")

    except:
        statusCode = 400
        output_body = "error: The body of your request is formatted incorrectly"
        return{
            "statusCode": statusCode,
            "headers": GlobalHeaders,
            "body": json.dumps(output_body)
        }



    try:
        claims = event["requestContext"]["authorizer"]["claims"]
        calling_user_email = claims.get("email")

        #first we verify if the calling user has the admin role 
        caller_user_row =  table.get_item(Key= {"ID": "USER#" + calling_user_email}).get("Item")
        user_roles = caller_user_row.get("Roles", [])


        if not ("Admin" in user_roles):
            statusCode = 403
            output_body = "Error: You do not have permission to edit a template."
            return{
                "statusCode": statusCode,
                "headers": GlobalHeaders,       
                "body": json.dumps(output_body)}
    
    except Exception as e:
        statusCode = 500
        output_body = "Error reading data from the table. Ended with this error: " + str(e)
        return{
                "statusCode": statusCode,
                "headers": GlobalHeaders,       
                "body": json.dumps(output_body)
            }


    output_body = "successs"
    statusCode = 200
    for user in newUsers:
        
        email = user["Email"]
        password = user["Password"]
        role    = user["Role"]
        firstName = user["FirstName"]
        lastName = user["LastName"]
        try:
            #now here we finally try the user creation 
            cognito.admin_create_user(
                UserPoolId = USER_POOL_ID,
                Username = user["Email"],
                UserAttributes=[
                {"Name": "email", "Value": email},
                {"Name": "email_verified", "Value": "true"},
            ],
            MessageAction="SUPPRESS",  # no welcome email
            )

            # 2. Set a permanent password
            cognito.admin_set_user_password(
                UserPoolId=USER_POOL_ID,
                Username=email,
                Password=password,
                Permanent=True,
            )

            #after the cognito phase, we need to make a user row for them in the table 

            user_row_to_insert = {
                "ID": "USER#" + email,
                "Courses": {},
                "FirstName": firstName,
                "LastName": lastName,
                "Roles": {role}
            }

            
            table.put_item(Item =user_row_to_insert, ConditionExpression="attribute_not_exists(ID)")
            

        except Exception as e:


            statusCode = 500
            output_body = "some student account creation failed, last encountered error:" + str(e) + ". For user: " + email 






    return{
        "statusCode": statusCode,
        "headers": GlobalHeaders,       
        "body": json.dumps(output_body)
    }
