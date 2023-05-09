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
import { store } from "../../store.js";

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
        <adc-input
          id="description"
          label="Description"
          placeholder="Description">
        </adc-input>            
        <adc-select
          id="owner"
          label="Owner"
          label-field="fullName"
          placeholder="Owner"
          style="min-width: 250px;">
        </adc-select>
        <adc-date-picker
          label="Due date"
          placeholder="Due date"
          style="flex-grow: 0; min-width: 165px;">
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
          style="flex-basis: 0; flex-grow: 1;">
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
          style="min-width: 250px;">
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
          placeholder="Effort"
          style="min-width: 165px;">
        </adc-select>                                                                          
      </adc-hbox>
      <adc-controls></adc-controls>      
      <adc-input 
        id="search"
        placeholder="Search actions" 
        size="lg" 
        type="search">
        <adc-icon name="search" slot="prefix"></adc-icon>
      </adc-input>
      <adc-table sortable selectable>
        <adc-column header-text="Priority" sortable width="150"></adc-column>      
        <adc-column header-text="Description" label-field="description" sortable></adc-column>
        <adc-column header-text="Owner" label-field="owner" sortable width="200"></adc-column>        
        <adc-column header-text="Due date" label-field="dueAt" sortable width="165"></adc-column>                
        <adc-column header-text="Status" label-field="status" sortable width="165"></adc-column>                        
        <adc-vbox slot="empty">
          <adc-label>No actions added yet.</adc-label>
        </adc-vbox>        
      </adc-table>
    `;

    // Private
    this._changed = false;
    this._data = null;
    this._people = [];
    this._priorities = [];
    this._status = [];    
    this._value = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$columns = this.shadowRoot.querySelectorAll( 'adc-column' );
    this.$columns[0].labelFunction = ( data ) => {
      let priority = null;
      for( let p = 0; p < this._priorities.length; p++ ) {
        if( this._priorities[p].id === data.priority ) {
          priority = this._priorities[p].name;          
          break;
        }
      }

      return priority;
    };
    this.$columns[2].labelFunction = ( data ) => {
      let person = null;
      for( let p = 0; p < this._people.length; p++ ) {
        if( this._people[p].id === data.owner ) {
          person = this._people[p].fullName;          
          break;
        }
      }

      return person;
    };   
    this.$columns[3].labelFunction = ( data ) => {
      const update = new Date( data.dueAt );
      const formatted = new Intl.DateTimeFormat( navigator.language, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      } ).format( update );    
      return formatted;
    };   
    this.$columns[4].labelFunction = ( data ) => {
      let status = null;
      for( let s = 0; s < this._status.length; s++ ) {
        if( this._status[s].id === data.status ) {
          status = this._status[s].name;          
          break;
        }
      }

      return status;
    };             
    this.$complete = this.shadowRoot.querySelector( '#complete' );
    this.$controls = this.shadowRoot.querySelector( 'adc-controls' );
    this.$controls.addEventListener( 'add', () => this.doActionAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doActionCancel() );
    this.$controls.addEventListener( 'delete', () => this.doActionDelete() );
    this.$controls.addEventListener( 'edit', () => this.doActionEdit() );
    this.$controls.addEventListener( 'save', () => this.doActionSave() );        
    this.$description = this.shadowRoot.querySelector( '#description' );
    this.$effort = this.shadowRoot.querySelector( '#effort' );
    this.$effort.selectedItemCompareFunction = ( provider, item ) => provider === item ? true : false;    
    this.$effort.provider = ['Small', 'Medium', 'Large', 'Extra Large'];
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) );     
    this.$milestone = this.shadowRoot.querySelector( '#milestone' ); 
    this.$milestone.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;       
    this.$owner = this.shadowRoot.querySelector( '#owner' );
    this.$owner.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;    
    this.$priority = this.shadowRoot.querySelector( '#priority' );    
    this.$priority.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;        
    this.$project = this.shadowRoot.querySelector( '#project' );
    this.$project.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;    
    this.$status = this.shadowRoot.querySelector( '#status' );
    this.$status.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;
    this.$table = this.shadowRoot.querySelector( 'adc-table' );   
    this.$search = this.shadowRoot.querySelector( '#search' );       
    this.$due = this.shadowRoot.querySelector( 'adc-date-picker' );

    // State
    store.milestone.subscribe( ( data ) => this.$milestone.provider = data );    
    store.person.subscribe( ( data ) => this.$owner.provider = data );    
    store.priority.subscribe( ( data ) => this.$priority.provider = data );    
    store.project.subscribe( ( data ) => this.$project.provider = data );        
    store.status.subscribe( ( data ) => this.$status.provider = data );    
    store.action.subscribe( ( data ) => this.$table.provider = data );    
    
    const action_index = window.localStorage.getItem( 'remote_action_index' ) === null ? null : parseInt( window.localStorage.getItem( 'remote_action_index' ) );

    // Read
    // TODO: What happens when reference table changes?
    // TODO: Invalidate table to re-render?
    db.Priority.toArray().then( ( data ) => {
      this._priorities = [... data];
      return db.Person.toArray();
    } )
    .then( ( people ) => {
      this._people = [... people];
      return db.Status.toArray();
    } )
    .then( ( status ) => {
      this._status = [... status];
      return db.Action.orderBy( 'description' ).toArray();
    } )
    .then( ( results ) => {
      this.$table.provider = results;      
      this.$table.selectedIndex = action_index === null ? null : action_index;      

      this.readOnly = true;
      this.value = action_index === null ? null : results[action_index];      
      this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;      
      
      store.action.set( results );
    } );        
  }

  clear() {
    this.$description.error = null;
    this.$description.invalid = false;
    this.$description.value = null;

    /*
    this.$url.error = null;
    this.$url.invalid = false;
    this.$url.value = null;
    this.$tags.value = null;        
    */
  }

  doActionAdd() {
    this.$table.selectedIndex = null;
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;
    this.value = null;
    this.clear();
    this._changed = false;
    this.readOnly = false;
    this.$description.focus();
  }  

  doActionCancel() {
    if( this._changed ) {
      const response = confirm( 'Do you want to save changes?' );
      
      if( response ) {
        this.doActionSave();
        this._changed = false;
        return;
      }
    }

    if( this._value === null ) {
      this.clear();
      this.$controls.mode = AvocadoControls.ADD_ONLY;
    } else {
      this.value = this._value;
      this.$controls.mode = AvocadoControls.ADD_EDIT;
    }

    this._changed = false;
    this.readOnly = true;    
  }  

  doActionDelete() {
    const id = this._value.id;    
    const response = confirm( `Delete ${this._value.description}?` );

    if( response ) {
      this.clear();
      this.value = null;
      this.$table.selectedIndex = null;
      window.localStorage.removeItem( 'remote_action_index' );
      this._changed = false;
      this.readOnly = true;
      this.$controls.mode = AvocadoControls.ADD_ONLY;

      db.Action.delete( id )
      .then( () => db.Action.orderBy( 'description' ).toArray() )
      .then( ( results ) => {
        this.$table.provider = results;        
        store.action.set( results );
      } );          
    }
  }

  doActionEdit() {
    this._changed = false;
    this.readOnly = false;
    this.$controls.mode = this._value === null ? AvocadoControls.ADD_EDIT : AvocadoControls.DELETE_CANCEL_SAVE;
    this.$description.focus();
  }  

  doActionSave() {
    if( this.$description.value === null ) {
      this.$description.error = 'Action description is a required field.';
      this.$description.invalid = true;
      return;
    } else {
      this.$description.error = null;
      this.$description.invalid = false;
    }

    const record = {
      completedAt: this.$complete.value === null ? null : this.$complete.value.getTime(),
      description: this.$description.value,
      dueAt: this.$due.value === null ? null : this.$due.value.getTime(),      
      effort: this.$effort.value === null ? null : this.$effort.value,
      milestone: this.$milestone.value === null ? null : this.$milestone.value.id,      
      owner: this.$owner.value === null ? null : this.$owner.value.id,
      priority: this.$priority.value === null ? null : this.$priority.value.id,
      project: this.$project.value === null ? null : this.$project.value.id,
      status: this.$status.value === null ? null : this.$status.value.id
    };  

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = this.value.id;
      record.createdAt = this.value.createdAt;
      record.updatedAt = Date.now();
      this.value = record;                

      db.Action.put( record )
      .then( () => db.Action.orderBy( 'description' ).toArray() )
      .then( ( results ) => {   
        this.$table.provider = results;

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$table.selectedIndex = r;
            window.localStorage.setItem( 'remote_action_index', r );
            break;
          }
        }

        store.action.set( results );
      } );
    } else {
      const at = Date.now();

      record.id = uuidv4();
      record.createdAt = at;
      record.updatedAt = at;
      this.value = record;

      db.Action.put( record )
      .then( () => db.Action.orderBy( 'description' ).toArray() )
      .then( ( results ) => {
        this.$table.provider = results;     

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$table.selectedIndex = r;
            window.localStorage.setItem( 'remote_action_index', r );
            break;
          }
        }

        store.action.set( results );
      } );            
    }

    this._changed = false;
    this.readOnly = true;
    this.$controls.mode = AvocadoControls.ADD_EDIT;
  }  

  doTableChange( evt ) {
    if( this._changed && !this.readOnly ) {
      const response = confirm( 'Do you want to save changes?' );
    
      if( response ) {
        this.doActionSave();
      }
    }

    console.log( evt );

    this.readOnly = true;
    this.value = evt.detail.selectedItem === null ? null : evt.detail.selectedItem;      
    this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;

    if( evt.detail.selectedItem === null ) {
      window.localStorage.removeItem( 'remote_action_index' );
    } else {
      window.localStorage.setItem( 'remote_action_index', evt.detail.selectedIndex );      
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

    if( this.value === null ) {
      this.$due.value = null; 
      this.$complete.value = null;  
    } else {
      this.$due.value = this.value.dueAt === null ? null : this.value.dueAt;
      this.$complete.value = this.value.completedAt === null ? null : this.value.completedAt;      
    }

    this.$description.value = this._value === null ? null : this._value.description;
    this.$effort.selectedItem = this._value === null ? null : this._value.effort;        
    this.$milestone.selectedItem = this._value === null ? null : {id: this._value.milestone};             
    this.$owner.selectedItem = this._value === null ? null : {id: this._value.owner};
    this.$priority.selectedItem = this._value === null ? null : {id: this._value.priority};    
    this.$project.selectedItem = this._value === null ? null : {id: this._value.project};        
    this.$status.selectedItem = this._value === null ? null : {id: this._value.status};
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
    return this._value;
  }

  set value( data ) {
    this._value = data === null ? null : Object.assign( {}, data );
    this._render();
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
