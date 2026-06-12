Here are some known issues that have yet to be addressed. Logged as of 6/12/2026




Potential Inefficiencies to fix with the BACKEND:
* /GetListOfTemplates is inefficient in how it gets course information.
* /GetCourseInformation is a bit inefficient in combine_course_info_with_studentSkillData. Additionally, When using student list, if a email is written incorrectly, there is currently no graceful handling 
* Functionality of /FetchUserData allows a teacher to get data for any other user, not just students. Fix later? Perhaps this is too permissive?
* /CheckStudentOff will fail if one of the student emails+skill combos is not found. Consider making some sort of better handling.
* Consider revisiting /AddStudentToCourse Errors to be more descriptive ie. when a student does not actually exist 
* Examine if /TokenToEmail fully implements expiration system correctly
* Need to fix global headers global variable in some endpoints code file. Some say POST when the endpoint is a GET for example. Does not break functionality, but good practice to have this be correct
* /CreateUser should have a better mechanism to compile errors when many users are made at once 


FRONTEND:
* The QR code may have a situation in which it expires by the time a student shows it to a teacher to get checked off. Maybe implementing a drag-down-refresh here to regen a new qr code in these cases would be a good idea?
