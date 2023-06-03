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
        <adc-column header-text="Owner" label-field="owner" sortable width="250"></adc-column>        
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
    this.$complete = this.shadowRoot.querySelector( '#complete' );
    this.$controls = this.shadowRoot.querySelector( 'adc-controls' );
    this.$controls.addEventListener( 'add', () => this.doControlsAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doControlsCancel() );
    this.$controls.addEventListener( 'delete', () => this.doControlsDelete() );
    this.$controls.addEventListener( 'edit', () => this.doControlsEdit() );
    this.$controls.addEventListener( 'save', () => this.doControlsSave() );        
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
      return db.Action.orderBy( 'dueAt' ).toArray();
    } )
    .then( ( actions ) => {
      console.log( actions );
      this.$table.provider = actions;  

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
