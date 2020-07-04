var express = require('express');
var router = express.Router()
let background = '#ff7070';
let menu = 'nav flex-column nav-pills';
let font = "'Times New Roman', Times, serif";
let color = '#000000'
let configServerSchemas = [ 'Song',  'Genre' ];
var Song = require('../Models/Song.js')
var schemaSong = require('../../schemas/Schema-Song.json')
var Genre = require('../Models/Genre.js')
var schemaGenre = require('../../schemas/Schema-Genre.json')

router.get('/Song', function (req, res) {     
    Song.top('name', 'DESC', '3', function (rows) {         
        res.render('home', {             
            rows: rows.map(obj => {                 
                return {                     
                    properties: Object.keys(obj).map(key => {                         
                        return {                             
                            name: key,                             
                            value: obj[key]                         
                            }                     
                    }),
                    actions: [{
                    link: './Song/Details/' + obj.id,     
                    image: { src: '../../images/read.png', alt: 'read'},     
                    tooltip: 'Details'
                    }]                 
                }             
            }),
            title: 'Song',
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            content: menu === "nav flex-column nav-pills" ? "8" : "12",
            styleMenuPosition: menu === "nav flex-column nav-pills",
            schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/frontoffice/' + s
                }
            }),              
            columns: Object.keys(new Song()).map(key => {                 
                return {                     
                    name: key                 
                };             
            })         
        });     
    }); 
}); 


router.get('/Song/Details/:id', (req, res) => {
        Song.get(req.params.id, function(row){
            res.render('peek', {
            title: "Song",
            classValue: "",
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            styleMenuPosition: menu === "nav flex-column nav-pills",
            content: menu === "nav flex-column nav-pills" ? "8" : "12",          
            idValue: req.params.id,
            properties: function () {
                var allProps = Object.getOwnPropertyNames(row);
                //Array of valid properties to show
                var validProps = [];
                allProps.forEach((prop) =>{
                    //Checks if propertie exists on schema and if it does push it to array
                    // Doesnt include id property
                    if(schemaSong.properties.hasOwnProperty(prop)){
                        validProps.push({
                            name: prop,
                            image: schemaSong.properties[prop].presentationMode === "image" ? { value: row[prop] } : false,
                            video: schemaSong.properties[prop].presentationMode === "video" ? { value: row[prop] } : false,
                            text: schemaSong.properties[prop].presentationMode !== "video" && schemaSong.properties[prop].presentationMode !== "image" ? { value: schemaSong.properties[prop].type != 'boolean'? row[prop] : row[prop] == 1?'Yes':'False' } : false
                        });
                    }
                })
                return validProps;
            },
              schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/frontoffice/' + s
                }
            }),
            references: function () {
                var allRefs = [];
                if (schemaSong.references) {
                    schemaSong.references.forEach(function (ref) {
                        allRefs.push({
                            labelRef: ref.label,
                            model: ref.model,
                            isManyToMany: function () {
                                if (ref.relation == "M-M"){
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            },
                            values: ref.relation === "1-M" ?  row[(ref.model + "_id").toLowerCase()] : null,
                            atrName: ref.model.toLowerCase() + '_id'
                        });
                        }); 
                        }                     
                        return allRefs;             
            },             
            hasReferences: function () {                 
                return this.references().length > 0;             
            }   
        });
    });
});
router.get('/Genre', function (req, res) {     
    Genre.top('name', 'DESC', '3', function (rows) {         
        res.render('home', {             
            rows: rows.map(obj => {                 
                return {                     
                    properties: Object.keys(obj).map(key => {                         
                        return {                             
                            name: key,                             
                            value: obj[key]                         
                            }                     
                    }),
                    actions: [{
                    link: './Genre/Details/' + obj.id,     
                    image: { src: '../../images/read.png', alt: 'read'},     
                    tooltip: 'Details'
                    }]                 
                }             
            }),
            title: 'Genre',
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            content: menu === "nav flex-column nav-pills" ? "8" : "12",
            styleMenuPosition: menu === "nav flex-column nav-pills",
            schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/frontoffice/' + s
                }
            }),              
            columns: Object.keys(new Genre()).map(key => {                 
                return {                     
                    name: key                 
                };             
            })         
        });     
    }); 
}); 


router.get('/Genre/Details/:id', (req, res) => {
        Genre.get(req.params.id, function(row){
            res.render('peek', {
            title: "Genre",
            classValue: "",
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            styleMenuPosition: menu === "nav flex-column nav-pills",
            content: menu === "nav flex-column nav-pills" ? "8" : "12",          
            idValue: req.params.id,
            properties: function () {
                var allProps = Object.getOwnPropertyNames(row);
                //Array of valid properties to show
                var validProps = [];
                allProps.forEach((prop) =>{
                    //Checks if propertie exists on schema and if it does push it to array
                    // Doesnt include id property
                    if(schemaGenre.properties.hasOwnProperty(prop)){
                        validProps.push({
                            name: prop,
                            image: schemaGenre.properties[prop].presentationMode === "image" ? { value: row[prop] } : false,
                            video: schemaGenre.properties[prop].presentationMode === "video" ? { value: row[prop] } : false,
                            text: schemaGenre.properties[prop].presentationMode !== "video" && schemaGenre.properties[prop].presentationMode !== "image" ? { value: schemaGenre.properties[prop].type != 'boolean'? row[prop] : row[prop] == 1?'Yes':'False' } : false
                        });
                    }
                })
                return validProps;
            },
              schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/frontoffice/' + s
                }
            }),
            references: function () {
                var allRefs = [];
                if (schemaGenre.references) {
                    schemaGenre.references.forEach(function (ref) {
                        allRefs.push({
                            labelRef: ref.label,
                            model: ref.model,
                            isManyToMany: function () {
                                if (ref.relation == "M-M"){
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            },
                            values: ref.relation === "1-M" ?  row[(ref.model + "_id").toLowerCase()] : null,
                            atrName: ref.model.toLowerCase() + '_id'
                        });
                        }); 
                        }                     
                        return allRefs;             
            },             
            hasReferences: function () {                 
                return this.references().length > 0;             
            }   
        });
    });
});

module.exports = router;

 