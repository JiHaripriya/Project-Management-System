const express = require('express')
const mysql = require('mysql')
const Joi = require('joi')
const app = express()

app.use(express.json())

let projects = [], technologies = [], statusReports = []

// Create connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password here',
    database: 'project_management_system'
});

// Connect to database
db.connect((err) => {
    if(err) throw err
    console.log('Connection established')
})

const singleToDouble = (number) => {
    if(String(number).length == 1) return `0${number}`
    else return number 
}

const getFullTime = (string) => {
    const toFormat = new Date(string)
    return `${toFormat.getHours()}:${toFormat.getMinutes()}:${singleToDouble(toFormat.getSeconds())}`
}

const getFullDate = (string) => {
    const toFormat = new Date(string)
    return `${toFormat.getFullYear()}-${singleToDouble(toFormat.getMonth() + 1)}-${singleToDouble(toFormat.getDate())}`
}

function setTechnologyProjectMapping(technologyArray, projectId) {
    technologyArray.forEach(technology => {
        let sql = `INSERT INTO project_technology_mapping SET  ?`
        db.query(sql, {project_id: projectId, technology_name: technology}, (err, result) => {
            if(err) throw err
        })
    })
}

/*....................................................................................................................
        PROJECTS RELATED APIs

        Sample Data
        {
            "project_name": "Notes App version 4.",
            "project_desc": "j",
            "percentage_complete": 66,
            "start_date": "2020-01-02",
            "end_date": "2020-11-04",
            "tech_used": [
                "iOS",
                "JavaScript"
            ]
        }
....................................................................................................................*/

// Get all Projects
app.get('/getProjects', (req, res) => {
    let sql = 'SELECT * FROM projects';
    db.query(sql, (err, results) => {
        // If no such table exisits, ER_NO_SUCH_TABLE is the response
        if(err) return res.send(err.message)

        let sql = `SELECT * FROM project_technology_mapping`
        db.query(sql, (err, technologyMapping) => {
            // Group technologies by project
            technologies = technologyMapping.reduce((groups, current) => {
                groups[current.project_id] = groups[current.project_id] || []
                groups[current.project_id].push(current.technology_name)
                return groups
            }, {})

            // List of all project
            projects = results.map(eachProject => {
                eachProject.start_date = getFullDate(eachProject.start_date), eachProject.end_date = getFullDate(eachProject.end_date)
                technologies[eachProject.project_id] ? eachProject["tech_used"] = technologies[eachProject.project_id] : eachProject["tech_used"] = []
                return eachProject
            })
            res.send(projects)
        })
    })
})

// Server side validation
const projectDetailsSchema = Joi.object(
    {
        project_name: Joi.string().max(150).required(),
        project_desc: Joi.string().max(201).pattern(new RegExp('^[a-zA-Z .]*$')).required(),
        percentage_complete: Joi.number().min(0).max(100).required(),
        start_date: Joi.date().required(),
        end_date: Joi.date().min(Joi.ref('start_date')).required(),
        tech_used: Joi.array()
    }
)

// Create project i.e., store data endpoint
app.post('/storeProjectData', (req, res) => {
    // Posted data
    const projectDetails = {
        name: req.body.project_name, 
        description: req.body.project_desc, 
        percent: req.body.percentage_complete, 
        start_date: req.body.start_date, 
        end_date: req.body.end_date,
    }

    const validationStatus = projectDetailsSchema.validate(req.body)
    // Handling bad requests
    if(validationStatus.error) return res.status(400).send(validationStatus.error.details.map(errorMsg => errorMsg.message))
    else {
        let sql = `INSERT INTO projects SET ?`
        db.query(sql, projectDetails, (err, result) => {
            if(err) throw err

            // Successful updation request will return data in the body
            res.send(result)
        })
        let query = `SELECT project_id FROM projects WHERE name='${req.body.project_name}'`
        db.query(query, (err, result) => setTechnologyProjectMapping(req.body.tech_used, result[0].project_id))
        
    }
})

// Edit Project
app.put('/editProjectDetails/:id', (req, res) => {

    const projectDetails = {
        name: req.body.project_name, 
        description: req.body.project_desc, 
        percent: req.body.percentage_complete, 
        start_date: req.body.start_date, 
        end_date: req.body.end_date
    }

    const validationStatus = projectDetailsSchema.validate(req.body)
    // Handling bad requests
    if(validationStatus.error) return res.status(400).send(validationStatus.error.details.map(errorMsg => errorMsg.message))
    else {
        let sql = `UPDATE projects SET ? WHERE project_id=${req.params.id}`
        db.query(sql, projectDetails, (err, result) => {
            if(err) throw err

            // Successful updation request will return data in the body
            res.send(result)
        })

        // Remove previously entered technology list to update
        let query = `DELETE FROM project_technology_mapping WHERE project_id=${req.params.id}`
        db.query(query, (err, result) => {if(err) throw err})
        setTechnologyProjectMapping(req.body.tech_used, req.params.id)
    }
})


/*....................................................................................................................
        STATUS REPORT RELATED APIs
        
        Sample Data 
        {
            "projectId": 3,
            "date": "2020-11-11",
            "resourceName": "Ann",
            "emailId": "ann@gmail.com",
            "activityType": "Coding",
            "hoursSpent": "08:00",
            "submitDate": "2020-11-11",
            "submitTime": "22:36:08"
        }
....................................................................................................................*/

// Get all Status Reports
app.get('/getStatusReports', (req, res) => {
    let sql = `SELECT sr.project_id, sr.date, r.name, r.email_id, sr.activity, sr.hours_spent, sr.posted_on FROM status_report AS sr
    LEFT JOIN project_resource_mapping AS pr ON sr.project_id = pr.project_id 
    LEFT JOIN resources AS r ON sr.resource_id = r.resource_id`;
    
    db.query(sql, (err, results) => {
        // If no such table exisits, ER_NO_SUCH_TABLE is the response
        if(err) return res.send(err.message)

        // List of all Status Reports
        statusReports = results.map(eachReport => {
            return {
                "projectId": eachReport.project_id,
                "date": getFullDate(eachReport.date),
                "resourceName": eachReport.name,
                "emailId": eachReport.email_id,
                "activityType": eachReport.activity,
                "hoursSpent": eachReport.hours_spent,
                "submitDate": getFullDate(eachReport.posted_on),
                "submitTime": getFullTime(eachReport.posted_on)
            }
        })

        // Format list of reports to match codebase representation
        // Group resources by project
        const result = statusReports.reduce((groups, current) => {
            groups[current.projectId] = groups[current.projectId] || []
            groups[current.projectId].push(current)
            return groups
        }, {})

        // Extract grouped values as an array
        statusReports = Object.entries(result).map(reportDetails => reportDetails[1])

        // Remove project_id property from object
        statusReports.forEach(eachProjectStatus => {
            eachProjectStatus.forEach(eachReport => delete eachReport.projectId)
        })

        res.send(statusReports)
    })
})


// Server side validation
const statusReportSchema = Joi.object(
    {
        project_id : Joi.number().required(),
        date : Joi.date().required(),
        resourceName: Joi.string().required(),
        emailId: Joi.string().required(),
        activityType: Joi.string().required(),
        hoursSpent: Joi.string().required(),
        submitDate: Joi.string().required(),
        submitTime: Joi.string().required()
    }
)

// Post status report
app.post('/storeStatusReport', (req, res) => {
    
    // Get resource id of :email passed
    let sql = `SELECT resource_id FROM resources WHERE email_id='${req.body.emailId}'` 
    db.query(sql,(err, result) => {

        // If no such table exisits, ER_NO_SUCH_TABLE is the response
        if(err) return res.send(err.message)

        const resourceId = result[0].resource_id

        const validationStatus = statusReportSchema.validate(req.body)
        
        // Handling bad requests
        if(validationStatus.error) return res.status(400).send(validationStatus.error.details.map(errorMsg => errorMsg.message))
        else {

            // Posted data
            const statusReport = {
                project_id: req.body.projectId,
                date : req.body.date,
                resource_id: resourceId,
                activity: req.body.activityType,
                hours_spent : req.body.hoursSpent,
                posted_on: `${req.body.submitDate} ${req.body.submitTime}`
            }

            let sql = `INSERT INTO status_report SET ?`
            db.query(sql, statusReport, (err, response) => {
                // If no such table exisits, ER_NO_SUCH_TABLE is the response
                if(err) return res.send(err.message)
                // Successful updation request will return data in the body
                res.send(response)
            })
        }
    })
})

const port = process.env.PORT || 3000

app.listen(port, (error) => {
    if(error) return console.log(error)
    console.log(`Server started on ${port}`)
})
