import AvocadoHBox from "../../../containers/hbox.js";
import AvocadoVBox from "../../../containers/vbox.js";

import AvocadoColumn from "../../../controls/column.js";
import AvocadoDatePicker from "../../../controls/date-picker.js";
import AvocadoInput from "../../../controls/input.js";
import AvocadoLabel from "../../../controls/label.js";
import AvocadoSelect from "../../../controls/select.js";
import AvocadoTable from "../../../controls/table.js";

import AvocadoControls from "../../../comp/controls.js";

import { v4 as uuidv4 } from "../../../lib/uuid-9.0.0.js";
import { db } from "../../db.js";

export default class RemoteAction extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          padding: 16px 0 0 0;
          position: relative;
          height: 100%;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        adc-hbox {
          gap: 16px; 
          padding: 0 16px 0 16px;
        }

        adc-input:not( [type=search] ) {
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-input[type=search] {
          margin: 0 16px 0 16px;
        }

        adc-input[type=search]::part( error ) {
          display: none;
        }

        adc-input[type=search]::part( input ) {
          height: 48px;
        }        

        adc-input[type=search]::part( field ) {
          border-bottom: none;
        }      

        adc-spacer {
          --spacer-width: 346px;
        }

        adc-table {
          flex-basis: 0;
          flex-grow: 1;
          margin: 0 16px 16px 16px;
        }

        adc-vbox[slot=empty] {
          align-items: center;
          background-color: #f4f4f4;
          flex-basis: 0;
          flex-grow: 1;
          justify-content: center;
        }

        adc-vbox[slot=empty] adc-label {
          --label-color: #525252;
        }

        adc-controls {
          margin: 1px 16px 20px 16px;
        }
      </style>
      <adc-hbox>
        <adc-select
          id="owner"
          label="Owner"
          label-field="fullName"
          placeholder="Owner"
          style="min-width: 250px;">
        </adc-select>      
        <adc-input
          id="description"
          label="Description"
          placeholder="Description">
        </adc-input>            
        <adc-date-picker
          id="due"
          label="Due date"
          placeholder="Due date"
          style="flex-grow: 0; min-width: 165px;">
          <adc-label></adc-label>          
        </adc-date-picker>                  
        <adc-date-picker
          id="complete"
          label="Completed date"
          placeholder="Completed date"
          style="flex-grow: 0; min-width: 165px;">
        </adc-date-picker>                                                                       
      </adc-hbox>
      <adc-hbox>
        <adc-select
          id="project"
          label="Project"
          label-field="name"
          placeholder="Project"
          style="min-width: 250px;">
        </adc-select>          
        <adc-select
          id="milestone"
          label="Milestone"
          label-field="name"
          placeholder="Milestone"
          style="flex-basis: 0; flex-grow: 1;">
        </adc-select>          
        <adc-select
          id="status"
          label="Status"
          label-field="name"
          placeholder="Status"
          style="flex-basis: 0; flex-grow: 1;">
        </adc-select>          
        <adc-select
          id="priority"
          label="Priority"
          label-field="name"
          placeholder="Priority"
          style="min-width: 165px;">
        </adc-select>    
        <adc-select
          id="effort"
          label="Effort"
          label-field="name"
          placeholder="Effort"
          style="min-width: 165px;">
        </adc-select>                                                                          
      </adc-hbox>
      <adc-controls></adc-controls>      
      <adc-input 
        id="search"
        placeholder="Search descriptions" 
        size="lg" 
        type="search">
        <adc-icon name="search" slot="prefix"></adc-icon>
      </adc-input>
      <adc-table sortable selectable>
        <adc-column header-text="Owner" label-field="owner" sortable width="225"></adc-column>        
        <adc-column header-text="Description" label-field="description" sortable></adc-column>
        <adc-column header-text="Priority" label-field="priority" sortable width="165"></adc-column>              
        <adc-column header-text="Due date" label-field="dueAt" sortable width="165"></adc-column>                
        <adc-column header-text="Status" label-field="status" sortable width="165"></adc-column>                        
        <adc-vbox slot="empty">
          <adc-label>No actions added yet.</adc-label>
        </adc-vbox>        
      </adc-table>
    `;

    // Private
    this._created = null;
    this._data = null;
    this._updated = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$columns = this.shadowRoot.querySelectorAll( 'adc-column' );
    this.$columns[3].labelFunction = ( item ) => {
      if( item.dueAt === null ) {
        return '';
      }

      return new Intl.DateTimeFormat( navigator.language, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      } ).format( item.dueAt );    
    };
    this.$complete = this.shadowRoot.querySelector( '#complete' );
    this.$complete.addEventListener( 'change', () => {
      if( this.$complete.value === null ) {
        this.$remain.concealed = this.$due.value === null ? true : false;
        this.$remain.text = this.$due.value === null ? null : this.distance( this.$due.value );
      } else {
        this.$remain.concealed = true;
      }
    } );    
    this.$controls = this.shadowRoot.querySelector( 'adc-controls' );
    this.$controls.addEventListener( 'add', () => this.doControlsAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doControlsCancel() );
    this.$controls.addEventListener( 'delete', () => this.doControlsDelete() );
    this.$controls.addEventListener( 'edit', () => this.doControlsEdit() );
    this.$controls.addEventListener( 'save', () => this.doControlsSave() );        
    this.$description = this.shadowRoot.querySelector( '#description' );
    this.$effort = this.shadowRoot.querySelector( '#effort' );
    this.$effort.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;    
    this.$effort.provider = [
      {id: 0, name: 'None'}, 
      {id: 1, name: 'Small'}, 
      {id: 2, name: 'Medium'}, 
      {id: 3, name: 'Large'}, 
      {id: 4, name: 'Extra Large'},
      {id: 5, name: 'Huge'},
      {id: 6, name: 'Gigantic'},
      {id: 7, name: 'Uknowable'}
    ];
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) );     
    this.$table.selectedItemsCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;        
    this.$milestone = this.shadowRoot.querySelector( '#milestone' ); 
    this.$milestone.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;       
    this.$owner = this.shadowRoot.querySelector( '#owner' );
    this.$owner.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;
    this.$priority = this.shadowRoot.querySelector( '#priority' );    
    this.$priority.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;        
    this.$project = this.shadowRoot.querySelector( '#project' );
    this.$project.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;    
    this.$remain = this.shadowRoot.querySelector( 'adc-date-picker adc-label' );
    this.$status = this.shadowRoot.querySelector( '#status' );
    this.$status.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;
    this.$table = this.shadowRoot.querySelector( 'adc-table' );   
    this.$search = this.shadowRoot.querySelector( '#search' );       
    this.$search.addEventListener( 'input', ( evt ) => this.doSearchInput( evt ) );
    this.$search.addEventListener( 'clear', ( evt ) => this.doSearchClear( evt ) );   
    this.$due = this.shadowRoot.querySelector( 'adc-date-picker' );
    this.$due.addEventListener( 'change', () => {
      if( this.$complete.value === null ) {
        this.$remain.concealed = this.$due.value === null ? true : false;
        this.$remain.text = this.$due.value === null ? null : this.distance( this.$due.value );
      } else {
        this.$remain.concealed = true;
      }
    } );

    this.doActionLoad();
  }

  doActionLoad() {
    this.readOnly = true;

    db.Person.orderBy( 'fullName' ).toArray()
    .then( ( people ) => {
      this.$owner.provider = people;
      return db.Project.orderBy( 'name' ).toArray();
    } )
    .then( ( projects ) => {
      this.$project.provider = projects;
      return db.Milestone.orderBy( 'name' ).toArray();
    } )
    .then( ( stones ) => {
      this.$milestone.provider = stones;
      return db.Status.orderBy( 'name' ).toArray();
    } )
    .then( ( status ) => {
      this.$status.provider = status;
      return db.Priority.orderBy( 'name' ).toArray();
    } )
    .then( ( priorities ) => {
      this.$priority.provider = priorities;
      // return db.Action.orderBy( 'dueAt' ).toArray();
      // TODO: Elegant way to handle NULL value for dueAt
      return db.Action.toArray();
    } )
    .then( async ( actions ) => {
      this.$table.provider = await this.expandActions( actions );  

      const id = window.localStorage.getItem( 'remote_action_id' );

      if( id === null ) {
        this.value = null;
        this.$controls.mode = AvocadoControls.ADD_ONLY;        
      } else {
        this.$table.selectedItems = [{id: id}];      
        db.Action.where( {id: id} ).first()
        .then( ( item ) => {
          this.value = item;
          this.$controls.mode = item === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;
        } );
      }
    } );    
  }

  distance( value ) {
    const formatter = new Intl.RelativeTimeFormat( navigator.language, {
      style: 'short'
    } );
    let distance = ( value - Date.now() ) / 31556736000;
    let unit = 'year'    
    
    if( distance > -1 ) {
      unit = 'month'
      distance = ( value - Date.now() ) / 2629800000;      

      if( distance > -1 ) {
        unit = 'day'
        distance = ( value - Date.now() ) / 86400000;              
      }
    }    

    return formatter.format( Math.round( distance ), unit );
  }

  async expandActions( actions ) {
    return new Promise( async ( resolve, reject ) => {
      for( let a = 0; a < actions.length; a++ ) {
        const person = await db.Person.where( {id: actions[a].owner} ).first();
        actions[a].owner = person.fullName;
  
        if( actions[a].priority !== null ) {
          const priority = await db.Priority.where( {id: actions[a].priority} ).first();
          actions[a].priority = priority.name;
        }
  
        if( actions[a].status !== null ) {
          const status = await db.Status.where( {id: actions[a].status} ).first();
          actions[a].status = status.name;
        }        
      }  

      resolve( actions );
    } );
  }

  doControlsAdd() {
    window.localStorage.removeItem( 'remote_action_id' );

    this.$table.selectedItems = null;
    this.value = null;
    this.readOnly = false;
    this.$owner.focus();    
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;    
  }    

  doControlsCancel() {
    const id = window.localStorage.getItem( 'remote_action_id' );
    
    this.readOnly = true;    

    if( id === null ) {
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;
    } else {
      db.Action.where( {id: id} ).first()
      .then( ( item ) => {
        this.value = item;
        this.$controls.mode = AvocadoControls.ADD_EDIT;        
      } );
    }
  }  

  doControlsDelete() {
    const response = confirm( `Delete action?` );

    if( response ) {
      const id = window.localStorage.getItem( 'remote_action_id' );
      
      window.localStorage.removeItem( 'remote_action_id' );      

      db.Action.delete( id )
      .then( () => db.Action.toArray() )
      .then( async ( results ) => {
        this.$table.selectedItems = null;     
        this.$table.provider = await this.expandActions( results );        
        return db.Meeting.toArray();
      } )
      .then( async ( meetings ) => {
        for( let m = 0; m < meetings.length; m++ ) {
          if( meetings[m].actions !== null ) {
            const index = meetings[m].actions.indexOf( id );
            if( index >= 0 ) {
              meetings[m].actions.splice( index, 1 );
              if( meetings[m].actions.length === 0 ) {
                meetings[m].actions = null;
              }
              await db.Meeting.put( meetings[m] );
            }
          }
        }
      } );          

      this.value = null;
      this.readOnly = true;
      this.$controls.mode = AvocadoControls.ADD_ONLY;            
    }
  }   

  doControlsEdit() {
    this.readOnly = false;    
    this.$owner.focus();
    this.$controls.mode = AvocadoControls.DELETE_CANCEL_SAVE;    
  }

  doControlsSave() {
    if( this.$owner.value === null ) {
      this.$owner.error = 'Owner is a required field.';
      this.$owner.invalid = true;
      return;
    } else {
      this.$owner.error = null;
      this.$owner.invalid = false;
    }

    if( this.$description.value === null ) {
      this.$description.error = 'Description is a required field.';
      this.$description.invalid = true;
      return;
    } else {
      this.$description.error = null;
      this.$description.invalid = false;
    }

    const record = Object.assign( {}, this.value );

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = window.localStorage.getItem( 'remote_action_id' );
      record.createdAt = this._created;
      record.updatedAt = this._updated = Date.now();

      db.Action.put( record )
      .then( () => db.Action.toArray() )
      .then( async ( results ) => {
        this.$table.provider = await this.expandActions( results );
        this.$table.selectedItems = [{id: record.id}];
      } );
    } else {
      const at = Date.now();
      const id = uuidv4();

      window.localStorage.setItem( 'remote_action_id', id );

      record.id = id;
      record.createdAt = this._created = at;
      record.updatedAt = this._updated = at;

      db.Action.put( record )
      .then( () => db.Action.toArray() )
      .then( async ( results ) => {
        this.$table.provider = await this.expandActions( results );     
        this.$table.selectedItems = [{id: record.id}];
      } );            
    }

    this.readOnly = true;
    this.$controls.mode = AvocadoControls.ADD_EDIT;
  }  

  doSearchClear() {
    db.Action.toArray()
    .then( async ( results ) => {
      this.$table.provider = await this.expandActions( results );           

      const id = window.localStorage.getItem( 'remote_action_id' );

      if( id !== null ) {
        this.$table.selectedItems = [{id: id}];
      } else {
        this.$table.selectedItems = null;
      }
    } );          
  }  

  doSearchInput() {
    if( this.$controls.mode === AvocadoControls.CANCEL_SAVE || this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      const response = confirm( 'Do you want to save changes?' );
    
      if( response ) {
        this.$search.value = null;
        this.doControlsSave();
      }
    }

    this.$table.selectedItems = null;
    window.localStorage.removeItem( 'remote_action_id' );

    db.Action.toArray()
    .then( async ( results ) => {
      if( this.$search.value === null ) {
        this.doSearchClear();
        return;
      }

      if( results !== null ) {
        results = await this.expandActions( results );     
        this.$table.provider = results.filter( ( value ) => {
          const term = this.$search.value.toLowerCase();          
          return value.description.toLowerCase().indexOf( term ) >= 0 ? true : false;
        } );
      }
    } );    
  }   

  doTableChange( evt ) {
    if( this.$controls.mode === AvocadoControls.CANCEL_SAVE || this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      const response = confirm( 'Do you want to save changes?' );
    
      if( response ) {
        this.doControlsSave();
      }
    }

    this.readOnly = true;

    if( evt.detail.selectedItem === null ) {
      window.localStorage.removeItem( 'remote_action_id' );
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;      
    } else {
      window.localStorage.setItem( 'remote_action_id', evt.detail.selectedItem.id );
      db.Action.where( {id: evt.detail.selectedItem.id} ).first()
      .then( ( item ) => {
        this.value = item;
        console.log( item );
      } );
      this.$controls.mode = AvocadoControls.ADD_EDIT;      
    }
  }  

   // When attributes change
  _render() {
    this.$complete.readOnly = this.readOnly;
    this.$description.readOnly = this.readOnly;
    this.$effort.readOnly = this.readOnly;
    this.$owner.readOnly = this.readOnly;
    this.$due.readOnly = this.readOnly;
    this.$milestone.readOnly = this.readOnly;
    this.$priority.readOnly = this.readOnly;
    this.$project.readOnly = this.readOnly;
    this.$status.readOnly = this.readOnly;
  }

  // Promote properties
  // Values may be set before module load
  _upgrade( property ) {
    if( this.hasOwnProperty( property ) ) {
      const value = this[property];
      delete this[property];
      this[property] = value;
    }
  }

  // Setup
  connectedCallback() {
    this._upgrade( 'concealed' );        
    this._upgrade( 'data' );                
    this._upgrade( 'hidden' );    
    this._upgrade( 'readOnly' );
    this._upgrade( 'value' );    
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'hidden',
      'read-only'
    ];
  }

  // Observed attribute has changed
  // Update render
  attributeChangedCallback( name, old, value ) {
    this._render();
  } 

  // Properties
  // Not reflected
  // Array, Date, Object, null
  get data() {
    return this._data;
  }

  set data( value ) {
    this._data = value;
  }

  get value() {
    return {
      createdAt: this._created,
      updatedAt: this._updated,
      owner: this.$owner.selectedItem === null ? null : this.$owner.selectedItem.id,
      description: this.$description.value,
      dueAt: this.$due.value === null ? null : this.$due.value.getTime(),
      completedAt: this.$complete.value === null ? null : this.$complete.value.getTime(),
      project: this.$project.selectedItem === null ? null : this.$project.selectedItem.id,
      milestone: this.$milestone.selectedItem === null ? null : this.$milestone.selectedItem.id,      
      status: this.$status.selectedItem === null ? null : this.$status.selectedItem.id,      
      priority: this.$priority.selectedItem === null ? null : this.$priority.selectedItem.id,   
      effort: this.$effort.selectedItem === null ? null : this.$effort.selectedItem.id,   
    };
  }

  set value( data ) {
    if( data === null ) {
      this._created = null;
      this._updated = null;
      this.$owner.selectedItem = null;
      this.$owner.error = null;
      this.$owner.invalid = false;
      this.$description.value = null;
      this.$description.error = null;
      this.$description.invalid = false;
      this.$due.value = null;
      this.$remain.concealed = true;
      this.$complete.value = null;
      this.$project.selectedItem = null;
      this.$milestone.selectedItem = null;
      this.$status.selectedItem = null;
      this.$priority.selectedItem = null;
      this.$effort.selectedItem = null;
    } else {
      this._created = null;
      this._updated = null;
      this.$owner.selectedItem = data.owner === null ? null : {id: data.owner};
      this.$owner.error = null;
      this.$owner.invalid = false;
      this.$description.value = data.description;
      this.$description.error = null;
      this.$description.invalid = false;      
      this.$due.value = data.dueAt === null ? null : new Date( data.dueAt );
      
      if( data.completedAt === null ) {
        this.$remain.concealed = data.dueAt === null ? true : false;      
        this.$remain.text = data.dueAt === null ? null : this.distance( new Date( data.dueAt ) );      
      } else {
        this.$remain.concealed = true;              
      }

      this.$complete.value = data.completedAt === null ? null : new Date( data.completedAt );
      this.$project.selectedItem = data.project === null ? null : {id: data.project};
      this.$milestone.selectedItem = data.milestone === null ? null : {id: data.milestone};
      this.$status.selectedItem = data.status === null ? null : {id: data.status};
      this.$priority.selectedItem = data.priority === null ? null : {id: data.priority};
      this.$effort.selectedItem = data.effort === null ? null : {id: data.effort};
    }
  }    

  // Attributes
  // Reflected
  // Boolean, Number, String, null
  get concealed() {
    return this.hasAttribute( 'concealed' );
  }

  set concealed( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'concealed' );
      } else {
        this.setAttribute( 'concealed', '' );
      }
    } else {
      this.removeAttribute( 'concealed' );
    }
  }

  get hidden() {
    return this.hasAttribute( 'hidden' );
  }

  set hidden( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'hidden' );
      } else {
        this.setAttribute( 'hidden', '' );
      }
    } else {
      this.removeAttribute( 'hidden' );
    }
  }   

  get readOnly() {
    return this.hasAttribute( 'read-only' );
  }

  set readOnly( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'read-only' );
      } else {
        this.setAttribute( 'read-only', '' );
      }
    } else {
      this.removeAttribute( 'read-only' );
    }
  }       
}

window.customElements.define( 'arm-action', RemoteAction );
