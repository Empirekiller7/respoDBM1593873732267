var express = require('express');
var router = express.Router()
let background = '#ff7070';
let menu = 'nav flex-column nav-pills';
let font = "'Times New Roman', Times, serif";
let color = '#000000'
let configServerSchemas = [ 'Album',  'Artist',  'Genre',  'Song',  'Tag' ];

var Album = require('../Models/Album.js')
var schemaAlbum = require('../../schemas/Schema-Album.json')
var Artist = require('../Models/Artist.js')
var schemaArtist = require('../../schemas/Schema-Artist.json')
var Genre = require('../Models/Genre.js')
var schemaGenre = require('../../schemas/Schema-Genre.json')
var Song = require('../Models/Song.js')
var schemaSong = require('../../schemas/Schema-Song.json')
var Tag = require('../Models/Tag.js')
var schemaTag = require('../../schemas/Schema-Tag.json')

router.get('/', (req,res) => {
res.render('home-backoffice', {
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            content: menu === "nav flex-column nav-pills" ? "8" : "10 offset-md-1",
            styleMenuPosition: menu === "nav flex-column nav-pills",
            schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
            }
            })
});
});

router.get('/Album', (req, res) => {
        Album.all((rows) => {
            res.render('list', {    
            title: "Album",
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            content: menu === "nav flex-column nav-pills" ? "8" : "10 offset-md-1",
            styleMenuPosition: menu === "nav flex-column nav-pills",
            columns: Object.keys(new Album()),
            rows: rows.map(obj => {
               return { properties: Object.keys(obj).map(key => obj[key]),
            actions: [{
                    link: './Album/Details/' + obj.id,     
                    image: { src: '../../images/read.png', alt: 'read'},     
                    tooltip: 'Details'
                },
                {     
                    link: './Album/Edit/' + obj.id,
                    image: { src: '../../images/edit.png', alt: 'edit'},
                    tooltip: 'Edit' 
                },
                {
                    link: '#',
                    image: { src: '../../images/delete.png', alt: 'delete'},
                    tooltip: 'Delete',
                    events: [{
                        name: "onclick",
                        function: "remove",
                        args: obj.id
                        }]
                }]
                }
            }),
              schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
                }
            }),
        });
    });
});
router.get('/Album/Details/:id', (req, res) => {
        Album.get(req.params.id, function(row){
            res.render('details', {
            title: "Album",
            classValue: "Album",
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
                    if(schemaAlbum.properties.hasOwnProperty(prop)){
                        validProps.push({
                            name: prop,
                            image: schemaAlbum.properties[prop].presentationMode === "image" ? { value: row[prop] } : false,
                            video: schemaAlbum.properties[prop].presentationMode === "video" ? { value: row[prop] } : false,
                            text: schemaAlbum.properties[prop].presentationMode !== "video" && schemaAlbum.properties[prop].presentationMode !== "image" ? { value: schemaAlbum.properties[prop].type != 'boolean'? row[prop] : row[prop] == 1?'Yes':'False' } : false
                        });
                    }
                })
                return validProps;
            },
              schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
                }
            }),
            references: function () {
                var allRefs = [];
                if (schemaAlbum.references) {
                    schemaAlbum.references.forEach(function (ref) {
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

router.get('/Album/Insert', (req, res) => {  
    
        res.render('insert', {
            title: "Album",
            classValue: "Album",
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            styleMenuPosition: menu === "nav flex-column nav-pills",  
            content: menu === "nav flex-column nav-pills" ? "8" : "12",      
            properties: function () {
                var allProps = Object.getOwnPropertyNames(new Album());
                //Array of valid properties to show
                var validProps = [];
                allProps.forEach((prop) =>{
                    //Checks if propertie exists on schema and if it does push it to array
                    // Doesnt include id property
                    if(schemaAlbum.properties.hasOwnProperty(prop)){
                        validProps.push({
                            name: prop,
                            needsComma: allProps.indexOf(prop) < allProps.length - 1,
                            type: function(){
                                let val;
                                switch(schemaAlbum.properties[prop].type){
                                    case "integer":
                                    case "number": 
                                        val = "number";
                                        break;
                                    case "boolean": val = "checkbox";
                                        break;
                                    default:
                                        val="text";
                                        break;
                                }
                            return val;
                            },
                            required: schemaAlbum.required.includes(prop),
                            constraints: function(){
                                let constraint = [];
                                let types = {
                                    minimum: "min",
                                    maximum: "max",
                                    minLenght: "minLenght",
                                    maxLenght: "maxLenght",
                                    pattern: "pattern"
                                };
                                Object.keys(types).forEach(t => {
                                    if(schemaAlbum.properties[prop][t] !== undefined){
                                        constraint.push({
                                            name: types[t],
                                            value: schemaAlbum.properties[prop][t]
                                        });
                                    }
                                });
                                return constraint;
                            }
                        });
                    }
                })
                return validProps;
            },
            schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
                }
            }),
            references: function () {
                var allRefs = [];
                if (schemaAlbum.references) {
                    schemaAlbum.references.forEach(function (ref) {
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
                            atrName: ref.model.toLowerCase() + '_id'
                        });
                        }); 
                        }                     
                        return allRefs;             
            },             
            get hasReferences() {                 
                return this.references().length > 0;             
            }
        });
});

router.get('/Album/Edit/:id', (req, res) => {  
    Album.get(req.params.id, function(row){
        res.render('edit', {
            title: "Album",
            classValue: "Album", 
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            styleMenuPosition: menu === "nav flex-column nav-pills",
            content: menu === "nav flex-column nav-pills" ? "8" : "12",        
            idValue: req.params.id,         
            properties: function () {
                var allProps = Object.getOwnPropertyNames(new Album());
                //Array of valid properties to show
                var validProps = [];
                allProps.forEach((prop) =>{
                    //Checks if propertie exists on schema and if it does push it to array
                    // Doesnt include id property
                    if(schemaAlbum.properties.hasOwnProperty(prop)){
                        validProps.push({
                            name: prop,
                            value: row[prop],
                            needsComma: allProps.indexOf(prop) < allProps.length - 1,
                            type: function(){
                                let val;
                                switch(schemaAlbum.properties[prop].type){
                                    case "integer":
                                    case "number": 
                                        val = "number";
                                        break;
                                    case "boolean": val = "checkbox";
                                        break;
                                    default:
                                        val="text";
                                        break;
                                }
                            return val;
                            },
                            required: schemaAlbum.required.includes(prop),
                            constraints: function(){
                                let constraint = [];
                                let types = {
                                    minimum: "min",
                                    maximum: "max",
                                    minLenght: "minLenght",
                                    maxLenght: "maxLenght",
                                    pattern: "pattern"
                                };
                                Object.keys(types).forEach(t => {
                                    if(schemaAlbum.properties[prop][t] !== undefined){
                                        constraint.push({
                                            name: types[t],
                                            value: schemaAlbum.properties[prop][t]
                                        });
                                    }
                                });
                                return constraint;
                            },
                            
                        });
                    }
                })
                return validProps;
            },
            references: function () {
                var allRefs = [];
                if (schemaAlbum.references) {
                    schemaAlbum.references.forEach(function (ref) {
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
                            atrName: ref.model.toLowerCase() + '_id'
                        });
                        }); 
                        }                     
                        return allRefs;             
            },
            schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
                }
            }),             
            get hasReferences() {                 
                return this.references().length > 0;             
            }
        });
    });
});
router.get('/Artist', (req, res) => {
        Artist.all((rows) => {
            res.render('list', {    
            title: "Artist",
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            content: menu === "nav flex-column nav-pills" ? "8" : "10 offset-md-1",
            styleMenuPosition: menu === "nav flex-column nav-pills",
            columns: Object.keys(new Artist()),
            rows: rows.map(obj => {
               return { properties: Object.keys(obj).map(key => obj[key]),
            actions: [{
                    link: './Artist/Details/' + obj.id,     
                    image: { src: '../../images/read.png', alt: 'read'},     
                    tooltip: 'Details'
                },
                {     
                    link: './Artist/Edit/' + obj.id,
                    image: { src: '../../images/edit.png', alt: 'edit'},
                    tooltip: 'Edit' 
                },
                {
                    link: '#',
                    image: { src: '../../images/delete.png', alt: 'delete'},
                    tooltip: 'Delete',
                    events: [{
                        name: "onclick",
                        function: "remove",
                        args: obj.id
                        }]
                }]
                }
            }),
              schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
                }
            }),
        });
    });
});
router.get('/Artist/Details/:id', (req, res) => {
        Artist.get(req.params.id, function(row){
            res.render('details', {
            title: "Artist",
            classValue: "Artist",
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
                    if(schemaArtist.properties.hasOwnProperty(prop)){
                        validProps.push({
                            name: prop,
                            image: schemaArtist.properties[prop].presentationMode === "image" ? { value: row[prop] } : false,
                            video: schemaArtist.properties[prop].presentationMode === "video" ? { value: row[prop] } : false,
                            text: schemaArtist.properties[prop].presentationMode !== "video" && schemaArtist.properties[prop].presentationMode !== "image" ? { value: schemaArtist.properties[prop].type != 'boolean'? row[prop] : row[prop] == 1?'Yes':'False' } : false
                        });
                    }
                })
                return validProps;
            },
              schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
                }
            }),
            references: function () {
                var allRefs = [];
                if (schemaArtist.references) {
                    schemaArtist.references.forEach(function (ref) {
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

router.get('/Artist/Insert', (req, res) => {  
    
        res.render('insert', {
            title: "Artist",
            classValue: "Artist",
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            styleMenuPosition: menu === "nav flex-column nav-pills",  
            content: menu === "nav flex-column nav-pills" ? "8" : "12",      
            properties: function () {
                var allProps = Object.getOwnPropertyNames(new Artist());
                //Array of valid properties to show
                var validProps = [];
                allProps.forEach((prop) =>{
                    //Checks if propertie exists on schema and if it does push it to array
                    // Doesnt include id property
                    if(schemaArtist.properties.hasOwnProperty(prop)){
                        validProps.push({
                            name: prop,
                            needsComma: allProps.indexOf(prop) < allProps.length - 1,
                            type: function(){
                                let val;
                                switch(schemaArtist.properties[prop].type){
                                    case "integer":
                                    case "number": 
                                        val = "number";
                                        break;
                                    case "boolean": val = "checkbox";
                                        break;
                                    default:
                                        val="text";
                                        break;
                                }
                            return val;
                            },
                            required: schemaArtist.required.includes(prop),
                            constraints: function(){
                                let constraint = [];
                                let types = {
                                    minimum: "min",
                                    maximum: "max",
                                    minLenght: "minLenght",
                                    maxLenght: "maxLenght",
                                    pattern: "pattern"
                                };
                                Object.keys(types).forEach(t => {
                                    if(schemaArtist.properties[prop][t] !== undefined){
                                        constraint.push({
                                            name: types[t],
                                            value: schemaArtist.properties[prop][t]
                                        });
                                    }
                                });
                                return constraint;
                            }
                        });
                    }
                })
                return validProps;
            },
            schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
                }
            }),
            references: function () {
                var allRefs = [];
                if (schemaArtist.references) {
                    schemaArtist.references.forEach(function (ref) {
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
                            atrName: ref.model.toLowerCase() + '_id'
                        });
                        }); 
                        }                     
                        return allRefs;             
            },             
            get hasReferences() {                 
                return this.references().length > 0;             
            }
        });
});

router.get('/Artist/Edit/:id', (req, res) => {  
    Artist.get(req.params.id, function(row){
        res.render('edit', {
            title: "Artist",
            classValue: "Artist", 
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            styleMenuPosition: menu === "nav flex-column nav-pills",
            content: menu === "nav flex-column nav-pills" ? "8" : "12",        
            idValue: req.params.id,         
            properties: function () {
                var allProps = Object.getOwnPropertyNames(new Artist());
                //Array of valid properties to show
                var validProps = [];
                allProps.forEach((prop) =>{
                    //Checks if propertie exists on schema and if it does push it to array
                    // Doesnt include id property
                    if(schemaArtist.properties.hasOwnProperty(prop)){
                        validProps.push({
                            name: prop,
                            value: row[prop],
                            needsComma: allProps.indexOf(prop) < allProps.length - 1,
                            type: function(){
                                let val;
                                switch(schemaArtist.properties[prop].type){
                                    case "integer":
                                    case "number": 
                                        val = "number";
                                        break;
                                    case "boolean": val = "checkbox";
                                        break;
                                    default:
                                        val="text";
                                        break;
                                }
                            return val;
                            },
                            required: schemaArtist.required.includes(prop),
                            constraints: function(){
                                let constraint = [];
                                let types = {
                                    minimum: "min",
                                    maximum: "max",
                                    minLenght: "minLenght",
                                    maxLenght: "maxLenght",
                                    pattern: "pattern"
                                };
                                Object.keys(types).forEach(t => {
                                    if(schemaArtist.properties[prop][t] !== undefined){
                                        constraint.push({
                                            name: types[t],
                                            value: schemaArtist.properties[prop][t]
                                        });
                                    }
                                });
                                return constraint;
                            },
                            
                        });
                    }
                })
                return validProps;
            },
            references: function () {
                var allRefs = [];
                if (schemaArtist.references) {
                    schemaArtist.references.forEach(function (ref) {
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
                            atrName: ref.model.toLowerCase() + '_id'
                        });
                        }); 
                        }                     
                        return allRefs;             
            },
            schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
                }
            }),             
            get hasReferences() {                 
                return this.references().length > 0;             
            }
        });
    });
});
router.get('/Genre', (req, res) => {
        Genre.all((rows) => {
            res.render('list', {    
            title: "Genre",
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            content: menu === "nav flex-column nav-pills" ? "8" : "10 offset-md-1",
            styleMenuPosition: menu === "nav flex-column nav-pills",
            columns: Object.keys(new Genre()),
            rows: rows.map(obj => {
               return { properties: Object.keys(obj).map(key => obj[key]),
            actions: [{
                    link: './Genre/Details/' + obj.id,     
                    image: { src: '../../images/read.png', alt: 'read'},     
                    tooltip: 'Details'
                },
                {     
                    link: './Genre/Edit/' + obj.id,
                    image: { src: '../../images/edit.png', alt: 'edit'},
                    tooltip: 'Edit' 
                },
                {
                    link: '#',
                    image: { src: '../../images/delete.png', alt: 'delete'},
                    tooltip: 'Delete',
                    events: [{
                        name: "onclick",
                        function: "remove",
                        args: obj.id
                        }]
                }]
                }
            }),
              schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
                }
            }),
        });
    });
});
router.get('/Genre/Details/:id', (req, res) => {
        Genre.get(req.params.id, function(row){
            res.render('details', {
            title: "Genre",
            classValue: "Genre",
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
                    href: '/backoffice/' + s
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

router.get('/Genre/Insert', (req, res) => {  
    
        res.render('insert', {
            title: "Genre",
            classValue: "Genre",
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            styleMenuPosition: menu === "nav flex-column nav-pills",  
            content: menu === "nav flex-column nav-pills" ? "8" : "12",      
            properties: function () {
                var allProps = Object.getOwnPropertyNames(new Genre());
                //Array of valid properties to show
                var validProps = [];
                allProps.forEach((prop) =>{
                    //Checks if propertie exists on schema and if it does push it to array
                    // Doesnt include id property
                    if(schemaGenre.properties.hasOwnProperty(prop)){
                        validProps.push({
                            name: prop,
                            needsComma: allProps.indexOf(prop) < allProps.length - 1,
                            type: function(){
                                let val;
                                switch(schemaGenre.properties[prop].type){
                                    case "integer":
                                    case "number": 
                                        val = "number";
                                        break;
                                    case "boolean": val = "checkbox";
                                        break;
                                    default:
                                        val="text";
                                        break;
                                }
                            return val;
                            },
                            required: schemaGenre.required.includes(prop),
                            constraints: function(){
                                let constraint = [];
                                let types = {
                                    minimum: "min",
                                    maximum: "max",
                                    minLenght: "minLenght",
                                    maxLenght: "maxLenght",
                                    pattern: "pattern"
                                };
                                Object.keys(types).forEach(t => {
                                    if(schemaGenre.properties[prop][t] !== undefined){
                                        constraint.push({
                                            name: types[t],
                                            value: schemaGenre.properties[prop][t]
                                        });
                                    }
                                });
                                return constraint;
                            }
                        });
                    }
                })
                return validProps;
            },
            schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
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
                            atrName: ref.model.toLowerCase() + '_id'
                        });
                        }); 
                        }                     
                        return allRefs;             
            },             
            get hasReferences() {                 
                return this.references().length > 0;             
            }
        });
});

router.get('/Genre/Edit/:id', (req, res) => {  
    Genre.get(req.params.id, function(row){
        res.render('edit', {
            title: "Genre",
            classValue: "Genre", 
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            styleMenuPosition: menu === "nav flex-column nav-pills",
            content: menu === "nav flex-column nav-pills" ? "8" : "12",        
            idValue: req.params.id,         
            properties: function () {
                var allProps = Object.getOwnPropertyNames(new Genre());
                //Array of valid properties to show
                var validProps = [];
                allProps.forEach((prop) =>{
                    //Checks if propertie exists on schema and if it does push it to array
                    // Doesnt include id property
                    if(schemaGenre.properties.hasOwnProperty(prop)){
                        validProps.push({
                            name: prop,
                            value: row[prop],
                            needsComma: allProps.indexOf(prop) < allProps.length - 1,
                            type: function(){
                                let val;
                                switch(schemaGenre.properties[prop].type){
                                    case "integer":
                                    case "number": 
                                        val = "number";
                                        break;
                                    case "boolean": val = "checkbox";
                                        break;
                                    default:
                                        val="text";
                                        break;
                                }
                            return val;
                            },
                            required: schemaGenre.required.includes(prop),
                            constraints: function(){
                                let constraint = [];
                                let types = {
                                    minimum: "min",
                                    maximum: "max",
                                    minLenght: "minLenght",
                                    maxLenght: "maxLenght",
                                    pattern: "pattern"
                                };
                                Object.keys(types).forEach(t => {
                                    if(schemaGenre.properties[prop][t] !== undefined){
                                        constraint.push({
                                            name: types[t],
                                            value: schemaGenre.properties[prop][t]
                                        });
                                    }
                                });
                                return constraint;
                            },
                            
                        });
                    }
                })
                return validProps;
            },
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
                            atrName: ref.model.toLowerCase() + '_id'
                        });
                        }); 
                        }                     
                        return allRefs;             
            },
            schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
                }
            }),             
            get hasReferences() {                 
                return this.references().length > 0;             
            }
        });
    });
});
router.get('/Song', (req, res) => {
        Song.all((rows) => {
            res.render('list', {    
            title: "Song",
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            content: menu === "nav flex-column nav-pills" ? "8" : "10 offset-md-1",
            styleMenuPosition: menu === "nav flex-column nav-pills",
            columns: Object.keys(new Song()),
            rows: rows.map(obj => {
               return { properties: Object.keys(obj).map(key => obj[key]),
            actions: [{
                    link: './Song/Details/' + obj.id,     
                    image: { src: '../../images/read.png', alt: 'read'},     
                    tooltip: 'Details'
                },
                {     
                    link: './Song/Edit/' + obj.id,
                    image: { src: '../../images/edit.png', alt: 'edit'},
                    tooltip: 'Edit' 
                },
                {
                    link: '#',
                    image: { src: '../../images/delete.png', alt: 'delete'},
                    tooltip: 'Delete',
                    events: [{
                        name: "onclick",
                        function: "remove",
                        args: obj.id
                        }]
                }]
                }
            }),
              schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
                }
            }),
        });
    });
});
router.get('/Song/Details/:id', (req, res) => {
        Song.get(req.params.id, function(row){
            res.render('details', {
            title: "Song",
            classValue: "Song",
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
                    href: '/backoffice/' + s
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

router.get('/Song/Insert', (req, res) => {  
    
        res.render('insert', {
            title: "Song",
            classValue: "Song",
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            styleMenuPosition: menu === "nav flex-column nav-pills",  
            content: menu === "nav flex-column nav-pills" ? "8" : "12",      
            properties: function () {
                var allProps = Object.getOwnPropertyNames(new Song());
                //Array of valid properties to show
                var validProps = [];
                allProps.forEach((prop) =>{
                    //Checks if propertie exists on schema and if it does push it to array
                    // Doesnt include id property
                    if(schemaSong.properties.hasOwnProperty(prop)){
                        validProps.push({
                            name: prop,
                            needsComma: allProps.indexOf(prop) < allProps.length - 1,
                            type: function(){
                                let val;
                                switch(schemaSong.properties[prop].type){
                                    case "integer":
                                    case "number": 
                                        val = "number";
                                        break;
                                    case "boolean": val = "checkbox";
                                        break;
                                    default:
                                        val="text";
                                        break;
                                }
                            return val;
                            },
                            required: schemaSong.required.includes(prop),
                            constraints: function(){
                                let constraint = [];
                                let types = {
                                    minimum: "min",
                                    maximum: "max",
                                    minLenght: "minLenght",
                                    maxLenght: "maxLenght",
                                    pattern: "pattern"
                                };
                                Object.keys(types).forEach(t => {
                                    if(schemaSong.properties[prop][t] !== undefined){
                                        constraint.push({
                                            name: types[t],
                                            value: schemaSong.properties[prop][t]
                                        });
                                    }
                                });
                                return constraint;
                            }
                        });
                    }
                })
                return validProps;
            },
            schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
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
                            atrName: ref.model.toLowerCase() + '_id'
                        });
                        }); 
                        }                     
                        return allRefs;             
            },             
            get hasReferences() {                 
                return this.references().length > 0;             
            }
        });
});

router.get('/Song/Edit/:id', (req, res) => {  
    Song.get(req.params.id, function(row){
        res.render('edit', {
            title: "Song",
            classValue: "Song", 
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            styleMenuPosition: menu === "nav flex-column nav-pills",
            content: menu === "nav flex-column nav-pills" ? "8" : "12",        
            idValue: req.params.id,         
            properties: function () {
                var allProps = Object.getOwnPropertyNames(new Song());
                //Array of valid properties to show
                var validProps = [];
                allProps.forEach((prop) =>{
                    //Checks if propertie exists on schema and if it does push it to array
                    // Doesnt include id property
                    if(schemaSong.properties.hasOwnProperty(prop)){
                        validProps.push({
                            name: prop,
                            value: row[prop],
                            needsComma: allProps.indexOf(prop) < allProps.length - 1,
                            type: function(){
                                let val;
                                switch(schemaSong.properties[prop].type){
                                    case "integer":
                                    case "number": 
                                        val = "number";
                                        break;
                                    case "boolean": val = "checkbox";
                                        break;
                                    default:
                                        val="text";
                                        break;
                                }
                            return val;
                            },
                            required: schemaSong.required.includes(prop),
                            constraints: function(){
                                let constraint = [];
                                let types = {
                                    minimum: "min",
                                    maximum: "max",
                                    minLenght: "minLenght",
                                    maxLenght: "maxLenght",
                                    pattern: "pattern"
                                };
                                Object.keys(types).forEach(t => {
                                    if(schemaSong.properties[prop][t] !== undefined){
                                        constraint.push({
                                            name: types[t],
                                            value: schemaSong.properties[prop][t]
                                        });
                                    }
                                });
                                return constraint;
                            },
                            
                        });
                    }
                })
                return validProps;
            },
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
                            atrName: ref.model.toLowerCase() + '_id'
                        });
                        }); 
                        }                     
                        return allRefs;             
            },
            schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
                }
            }),             
            get hasReferences() {                 
                return this.references().length > 0;             
            }
        });
    });
});
router.get('/Tag', (req, res) => {
        Tag.all((rows) => {
            res.render('list', {    
            title: "Tag",
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            content: menu === "nav flex-column nav-pills" ? "8" : "10 offset-md-1",
            styleMenuPosition: menu === "nav flex-column nav-pills",
            columns: Object.keys(new Tag()),
            rows: rows.map(obj => {
               return { properties: Object.keys(obj).map(key => obj[key]),
            actions: [{
                    link: './Tag/Details/' + obj.id,     
                    image: { src: '../../images/read.png', alt: 'read'},     
                    tooltip: 'Details'
                },
                {     
                    link: './Tag/Edit/' + obj.id,
                    image: { src: '../../images/edit.png', alt: 'edit'},
                    tooltip: 'Edit' 
                },
                {
                    link: '#',
                    image: { src: '../../images/delete.png', alt: 'delete'},
                    tooltip: 'Delete',
                    events: [{
                        name: "onclick",
                        function: "remove",
                        args: obj.id
                        }]
                }]
                }
            }),
              schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
                }
            }),
        });
    });
});
router.get('/Tag/Details/:id', (req, res) => {
        Tag.get(req.params.id, function(row){
            res.render('details', {
            title: "Tag",
            classValue: "Tag",
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
                    if(schemaTag.properties.hasOwnProperty(prop)){
                        validProps.push({
                            name: prop,
                            image: schemaTag.properties[prop].presentationMode === "image" ? { value: row[prop] } : false,
                            video: schemaTag.properties[prop].presentationMode === "video" ? { value: row[prop] } : false,
                            text: schemaTag.properties[prop].presentationMode !== "video" && schemaTag.properties[prop].presentationMode !== "image" ? { value: schemaTag.properties[prop].type != 'boolean'? row[prop] : row[prop] == 1?'Yes':'False' } : false
                        });
                    }
                })
                return validProps;
            },
              schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
                }
            }),
            references: function () {
                var allRefs = [];
                if (schemaTag.references) {
                    schemaTag.references.forEach(function (ref) {
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

router.get('/Tag/Insert', (req, res) => {  
    
        res.render('insert', {
            title: "Tag",
            classValue: "Tag",
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            styleMenuPosition: menu === "nav flex-column nav-pills",  
            content: menu === "nav flex-column nav-pills" ? "8" : "12",      
            properties: function () {
                var allProps = Object.getOwnPropertyNames(new Tag());
                //Array of valid properties to show
                var validProps = [];
                allProps.forEach((prop) =>{
                    //Checks if propertie exists on schema and if it does push it to array
                    // Doesnt include id property
                    if(schemaTag.properties.hasOwnProperty(prop)){
                        validProps.push({
                            name: prop,
                            needsComma: allProps.indexOf(prop) < allProps.length - 1,
                            type: function(){
                                let val;
                                switch(schemaTag.properties[prop].type){
                                    case "integer":
                                    case "number": 
                                        val = "number";
                                        break;
                                    case "boolean": val = "checkbox";
                                        break;
                                    default:
                                        val="text";
                                        break;
                                }
                            return val;
                            },
                            required: schemaTag.required.includes(prop),
                            constraints: function(){
                                let constraint = [];
                                let types = {
                                    minimum: "min",
                                    maximum: "max",
                                    minLenght: "minLenght",
                                    maxLenght: "maxLenght",
                                    pattern: "pattern"
                                };
                                Object.keys(types).forEach(t => {
                                    if(schemaTag.properties[prop][t] !== undefined){
                                        constraint.push({
                                            name: types[t],
                                            value: schemaTag.properties[prop][t]
                                        });
                                    }
                                });
                                return constraint;
                            }
                        });
                    }
                })
                return validProps;
            },
            schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
                }
            }),
            references: function () {
                var allRefs = [];
                if (schemaTag.references) {
                    schemaTag.references.forEach(function (ref) {
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
                            atrName: ref.model.toLowerCase() + '_id'
                        });
                        }); 
                        }                     
                        return allRefs;             
            },             
            get hasReferences() {                 
                return this.references().length > 0;             
            }
        });
});

router.get('/Tag/Edit/:id', (req, res) => {  
    Tag.get(req.params.id, function(row){
        res.render('edit', {
            title: "Tag",
            classValue: "Tag", 
            backgroundColor: background, 
            menuPosition: menu,
            fontLetter: font,
            colorLetter: color,
            styleMenuPosition: menu === "nav flex-column nav-pills",
            content: menu === "nav flex-column nav-pills" ? "8" : "12",        
            idValue: req.params.id,         
            properties: function () {
                var allProps = Object.getOwnPropertyNames(new Tag());
                //Array of valid properties to show
                var validProps = [];
                allProps.forEach((prop) =>{
                    //Checks if propertie exists on schema and if it does push it to array
                    // Doesnt include id property
                    if(schemaTag.properties.hasOwnProperty(prop)){
                        validProps.push({
                            name: prop,
                            value: row[prop],
                            needsComma: allProps.indexOf(prop) < allProps.length - 1,
                            type: function(){
                                let val;
                                switch(schemaTag.properties[prop].type){
                                    case "integer":
                                    case "number": 
                                        val = "number";
                                        break;
                                    case "boolean": val = "checkbox";
                                        break;
                                    default:
                                        val="text";
                                        break;
                                }
                            return val;
                            },
                            required: schemaTag.required.includes(prop),
                            constraints: function(){
                                let constraint = [];
                                let types = {
                                    minimum: "min",
                                    maximum: "max",
                                    minLenght: "minLenght",
                                    maxLenght: "maxLenght",
                                    pattern: "pattern"
                                };
                                Object.keys(types).forEach(t => {
                                    if(schemaTag.properties[prop][t] !== undefined){
                                        constraint.push({
                                            name: types[t],
                                            value: schemaTag.properties[prop][t]
                                        });
                                    }
                                });
                                return constraint;
                            },
                            
                        });
                    }
                })
                return validProps;
            },
            references: function () {
                var allRefs = [];
                if (schemaTag.references) {
                    schemaTag.references.forEach(function (ref) {
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
                            atrName: ref.model.toLowerCase() + '_id'
                        });
                        }); 
                        }                     
                        return allRefs;             
            },
            schemas: configServerSchemas.map(s => {
                return {
                    name: s,
                    href: '/backoffice/' + s
                }
            }),             
            get hasReferences() {                 
                return this.references().length > 0;             
            }
        });
    });
});

module.exports = router;