// import { ModuleImporter } from "../helpers/moduleImporter.js";
import * as Models from '../models'

export class BaseService{
    
    // static getAll = async (predicate, Model) => {
    //     let table = Model.table;
    //     let items = [];
    //     await fetch(`app/data/${table}.json`)
    //         .then(resp => resp.text())
    //         .then(text => items = JSON.tryParse(text));
    //     if(predicate){
    //         items = items.filter(predicate);
    //     }
        
    //     return items.map(item => new Model(item));
    // }

    // static getOne = async (id, Model) => { 
    //     let items = await BaseService.getAll(item => item.id == id, Model)
    //     return items.length == 1 ? items.pop() : null;
    // }


    //Version non static

    getAll = async (predicate) => { //row => row.price > 100
        let table = this.constructor.name.replace("Service","").toLowerCase();
        let items = [];
        await fetch(`./data/${table}.json`)
            .then(resp => resp.text())
            .then(text => items = JSON.parse(text))
            .catch(err => console.log(err));
        if(predicate){
            items = items.filter(predicate);
        }

        let Model = Models[this.constructor.name.replace("Service","")]
        items = Model.from(items);
        if(items.length === 0){
            return items;
        }

        for(const relation of this.relations){
            let item = items.last();

            if(item.hasOneTooRelations[relation]){
                const {fk, name} = item.hasOneTooRelations[relation];
                let Service = Models[relation+"Service"];
                let service = new Service();
                let relItems = await service.getAll();
                items.forEach(it => {
                    it[name] = relItems.find(row => row[fk] === it.id);
                });
                // debugger;
            }

            if(item.hasOneRelations[relation]){
                const {fk, name} = item.hasOneRelations[relation];
                let Service = Models[relation+"Service"];
                let service = new Service();
                let relItems = await service.getAll();
                items.forEach(it => {
                    it[name] = relItems.find(row => row.id === it[fk]);
                })
                //debugger;
            }

            if(item.hasManyRelations[relation]){
                const {fk, name} = item.hasManyRelations[relation];
                let Service = Models[relation+"Service"];
                let service = new Service();
                let relItems = await service.getAll();
                items.forEach(it => {
                    it[name] = relItems.filter(row => row[fk] === it.id);
                })
                //debugger;
            }

            if(item.hasManyThroughRelations[relation]){
                const {through, fk_model, fk, name} = item.hasManyThroughRelations[relation];
                let ThroughService = Models[through+"Service"];
                let throughService = new ThroughService();
                let throughItems = await throughService.getAll();
                let Service = Models[relation+"Service"];
                let modelService = new Service();
                let models = await modelService.getAll();
                throughItems.forEach(row => {
                    row[relation.toLowerCase()] = models.find(el => el.id === row[fk_model]);
                });
                items.forEach(it => {
                    it[name] = throughItems.filter(el => el[fk] === it.id);
                });
                //debugger;
            }
        }

        return items;
        
    }

    getOne = async (id) => { 
        // let items = await this.getAll(item => item.id == id);
        let table = this.constructor.name.replace("Service","").toLowerCase();
        let items = [];
        await fetch(`./data/${table}.json`)
            .then(resp => resp.text())
            .then(text => items = JSON.tryParse(text));
        
        items = items.filter(row => row.id === id);
        let Model = Models[this.constructor.name.replace("Service","")]
        let item = items.length === 1 ? Model.from(items.pop()) : null;
        if(!item){
            return null;
        }

        for(const relation of this.relations){

            if(item.hasOneTooRelations[relation]){
                const {fk, name} = item.hasOneTooRelations[relation];
                let Service = Models[relation+"Service"];
                let service = new Service();
                let models = await service.getAll(row => row[fk] === item.id);
                item[name] = models.length === 1 ? models.pop() : null;
                //debugger;
            }

            
            if(item.hasOneRelations[relation]){
                const {fk, name} = item.hasOneRelations[relation];
                let Service = Models[relation+"Service"];
                let service = new Service();
                item[name] = await service.getOne(item[fk]);
                // debugger;
            }

            if(item.hasManyRelations[relation]){
                const {fk, name} = item.hasManyRelations[relation];
                let Service = Models[relation+"Service"];
                let service = new Service();
                item[name] = await service.getAll(row => row[fk] === item.id);
                // debugger;
            }

            if(item.hasManyThroughRelations[relation]){
                const {through, fk_model, fk, name} = item.hasManyThroughRelations[relation];
                let ThroughService = Models[through+"Service"];
                let throughService = new ThroughService();
                let throughItems = await throughService.getAll(rows => rows[fk] === item.id);
                let modelIds = throughItems.map(row => row[fk_model]);
                let Service = Models[relation+"Service"];
                let modelService = new Service();
                let models = await modelService.getAll(row => modelIds.includes(row.id));
                throughItems.forEach(row => {
                    row[relation.toLowerCase()] = models.find(it => it.id === row[fk_model]);
                })
                item[name] = throughItems;
                // debugger;
            }
        }
        return item;
    }

    with = (relation) => {
        this.relations.push(relation);
        return this;
    }
    relations = [];

}