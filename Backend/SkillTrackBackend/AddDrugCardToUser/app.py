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
        CardID = str(CardID) #reconvert to a string as that is the format we will actually need it in

        genericName = input_body.get('genericName' , '')
        tradeName = input_body.get('tradeName' , '')        
        pronunciation = input_body.get('pronunciation' , '')
        therapeuticClass = input_body.get('therapeuticClass' , '')
        dose = input_body.get('dose' , '')
        routes = input_body.get('routes' , '')
        timeFrequency = input_body.get('timeFrequency' , '')
        normalDosageRange = input_body.get('normalDosageRange' , '')
        onset = input_body.get('onset' , '')        
        peak = input_body.get('peak' , '')
        duration = input_body.get('duration' , '')
        ivCompatibility = input_body.get('ivCompatibility' , '')
        whyPatientGettingMed =input_body.get('whyPatientGettingMed' , '')
        nursingImplications =input_body.get('nursingImplications' , '')
        mechanismOfAction = input_body.get('mechanismOfAction' , '')
        commonSideEffects = input_body.get('commonSideEffects' , '')
        interactions = input_body.get('interactions' , '')
        labValueAlterations = input_body.get('labValueAlterations' , '')
        patientTeaching =input_body.get('patientTeaching' , '')
        nursingAssessment = input_body.get('nursingAssessment' , '')
        holdAssessment = input_body.get('holdAssessment' , '')
        evaluation =input_body.get('evaluation' , '')         


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



    #here we go ahead and cosnstruct the drug card based on what was provided
    try:

        #first we create the new drug card
        newDrugCard = {
            'genericName': genericName,
            'tradeName': tradeName,
            'pronunciation': pronunciation,
            'therapeuticClass': therapeuticClass,
            'dose': dose,
            'routes': routes,
            'timeFrequency': timeFrequency,
            'normalDosageRange': normalDosageRange,
            'onset': onset,
            'peak': peak,
            'duration': duration,
            'ivCompatibility': ivCompatibility,
            'whyPatientGettingMed': whyPatientGettingMed,
            'nursingImplications': nursingImplications,
            'mechanismOfAction': mechanismOfAction,
            'commonSideEffects': commonSideEffects,
            'interactions': interactions,
            'labValueAlterations': labValueAlterations,
            'patientTeaching': patientTeaching,
            'nursingAssessment': nursingAssessment,
            'holdAssessment': holdAssessment,
            'evaluation': evaluation,
        }



        #now we add it to the table 
        table.update_item(
            Key ={
                "ID": f"USER_RESOURCES_FOR#{calling_user_email}"
            },
            UpdateExpression= "SET #DrugCards.#CURRENTCARD = :card",
            ExpressionAttributeNames={
                "#DrugCards":    'DrugCards',
                '#CURRENTCARD':   str(CardID)
            },
            ExpressionAttributeValues={
                ":card": newDrugCard
            }
        )

    except Exception as e:
        statusCode = 500
        output_body = "failed create drug card. Finished with this error: " + str(e)
        return{
            "statusCode": statusCode,
            "headers": GlobalHeaders,
            "body": json.dumps(output_body)
        }


    



    statusCode = 200
    output_body ="Success"

    return{
        "statusCode": statusCode,
        "headers": GlobalHeaders,       
        "body": json.dumps(output_body)

    }


