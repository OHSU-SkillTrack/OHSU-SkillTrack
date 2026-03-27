import json
import os
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])

GlobalHeaders ={"Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "DELETE,OPTIONS"}


def hard_delete_course(event, context):



    claims = event["requestContext"]["authorizer"]["claims"]
    email = claims.get("email")

    statusCode = 0
    output_body =       ""

    #first we check the API call format

    try:
        ID_of_CourseToDelete = event["queryStringParameters"]["Course_ID"]
    
    except:
        statusCode = 400
        output_body = "Incorrectly formatted API call"
        return {
            "statusCode": statusCode,
            "headers": GlobalHeaders,       
            "body": json.dumps(output_body)
        }    



    try:
        #verify if the calling user has the admin role 
        caller_user_row =  table.get_item(Key= {"ID": "USER#" + email}).get("Item")
        user_roles = caller_user_row.get("Roles", [])

        if not ("Admin" in user_roles):
            statusCode = 403
            output_body = "Error: You do not have permission to delete courses"
            return{
                "statusCode": statusCode,
                "headers": GlobalHeaders,       
                "body": json.dumps(output_body)
            }
        
        #save the course ID here 
        courseToDelete =   table.get_item(Key= {"ID": "COURSE#" + ID_of_CourseToDelete}).get("Item")

    except Exception as e:
        statusCode = 500
        output_body = "Error reading data from the table. Ended with this error: " + str(e)
        return{
                "statusCode": statusCode,
                "headers": GlobalHeaders,       
                "body": json.dumps(output_body)
            }




    #there are three key steps to wiping out a course. First we need to eliminate it in the teacher records, then in the student records, then we can remove the actual row itself
   
    #first wipe away from teacher rows
    try:
        teachers = courseToDelete.get("Teachers", [])

        for teacher in teachers:
            table.update_item(
                Key = {
                    "ID": f"USER#{teacher}"
                },
                UpdateExpression = "DELETE TeachingTheseCourses :selectedCourse",
                ExpressionAttributeValues={
                    ":selectedCourse": {ID_of_CourseToDelete} 
                }

            )

    except:
        statusCode = 500
        output_body = "Error reading data from the table. Ended with this error: " + str(e)
        return{
                "statusCode": statusCode,
                "headers": GlobalHeaders,       
                "body": json.dumps(output_body)
            }


    #now we wipe away from student rows 
    try:
        students = courseToDelete.get("Students", [])

        for student in students:
            table.update_item(
                Key = {
                    "ID": f"USER#{student}"
                },
                UpdateExpression = "REMOVE Courses.#selectedCourse",
                ExpressionAttributeNames={
                    "#selectedCourse": ID_of_CourseToDelete
                }

            )

    except:
        statusCode = 500
        output_body = "Error reading data from the table. Ended with this error: " + str(e)
        return{
                "statusCode": statusCode,
                "headers": GlobalHeaders,       
                "body": json.dumps(output_body)
            }
    

    #finally, we can delete this row itself
    try:
        table.delete_item(
            Key = {
                "ID": f"COURSE#{ID_of_CourseToDelete}"
            }
            
        )


    except:
        statusCode = 500
        output_body = "Error reading data from the table. Ended with this error: " + str(e)
        return{
                "statusCode": statusCode,
                "headers": GlobalHeaders,       
                "body": json.dumps(output_body)
            }
    







    statusCode = 200
    output_body = "deleted"
    return{
        "statusCode": statusCode,
        "headers": GlobalHeaders,       
        "body": json.dumps(output_body)
    }



    #




    
    

