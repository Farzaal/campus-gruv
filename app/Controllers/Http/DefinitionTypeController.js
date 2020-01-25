'use strict'
const DefinitionType = use('App/Models/DefinitionType')
const PostMaster = use('App/Models/PostMaster')
const R = require('ramda')
var fs = require('fs')
const util = require('util');
var Helpers = use('Helpers')
var pdf = require('html-pdf')

class DefinitionTypeController {

    async definitionType({ request, auth, response }) {

        const { def_type_id } = request.get()
        if (!def_type_id) {
            return response.status(722).json({ message: 'Missing def_type_id' })
        }
        const defTypes = await DefinitionType.query().where('id', def_type_id).with('definitionTypeDetail').fetch()
        if (R.isEmpty(defTypes.toJSON())) {
            return response.status(404).json({ message: 'No def_type found' })
        }
        return response.status(200).json(defTypes.toJSON())
    }

    async generatePdf({ request, response }) {
        
        const body = request.get()
        if(!body.post_id) {
            return response.status(722).json({ message: 'Post_id is required' })
        }
        const postMaster = await PostMaster.query().where('id', body.post_id).with('users').with('postDetail').fetch()
        const postMasterJson = postMaster.toJSON()
        if(R.isEmpty(postMasterJson)) {
            return response.status(404).json({ message: 'No Post Found' })
        } 
        const html = this.template(postMasterJson)
        const options = { format: 'A4' };
        const filename = `${Helpers.tmpPath(`${body.post_id}.pdf`)}`
        
        pdf.create(html, options).toFile(filename, function (err, res) {
            if (err) console.log("Error \\", err);
        });
        return response.status(200).send({ message: 'Post PDF generated successfullys' })
    }

    async downloadPdf({ request, response }) {
        
        const body = request.get()
        if(!body.post_id) {
            return response.status(722).json({ message: 'Post_id is required' })
        }
        const pdfFilePath = Helpers.tmpPath(`${body.post_id}.pdf`)
        if(fs.existsSync(pdfFilePath)) {
            return response.download(pdfFilePath)
        }
        return response.status(400).send({ message: 'File not found' })
    }

    template(postMaster) {
        const templ = `<!DOCTYPE html>
        <html>
        <head>
        <style>
        div {
          padding: 5px;
        }
        
        h1 {
          text-align: center;
          text-transform: uppercase;
          color: #4CAF50;
        }
        
        p {
          text-indent: 50px;
          text-align: justify;
          letter-spacing: 3px;
        }
        
        a {
          text-decoration: none;
          color: #008CBA;
        }
        </style>
        </head>
        <body>
        
        <div>
        <h1>${postMaster[0].title}</h1>
        <p>${postMaster[0].description}</p>
        <p>Likes : ${postMaster[0].likes_count}</p>
        <p>View : ${postMaster[0].view_count}</p>
        <p>Created By : ${postMaster[0].users.first_name} ${postMaster[0].users.last_name}</p><br />
        <img src="${postMaster[0].postDetail[0].image_url}" width="100%" height="40%" />
        </div>
        
        </body>
        </html>`;
        return templ
    }
}

module.exports = DefinitionTypeController
