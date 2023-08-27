import AvocadoHBox from "../../../containers/hbox.js";
import AvocadoVBox from "../../../containers/vbox.js";

import AvocadoAvatar from "../../../controls/avatar.js";
import AvocadoColumn from "../../../controls/column.js";
import AvocadoDatePicker from "../../../controls/date-picker.js";
import AvocadoIcon from "../../../controls/icon.js";
import AvocadoInput from "../../../controls/input.js";
import AvocadoLabel from "../../../controls/label.js";
import AvocadoSelect from "../../../controls/select.js";
import AvocadoTable from "../../../controls/table.js";
import AvocadoTabs from "../../../containers/tabs.js";

import AvocadoControls from "../../../comp/controls.js";
import AvocadoNotes from "../../../comp/notes.js";

import RemoteSituationDetails from "./situation-details.js";
import RemoteSituationItemRender from "./situation-item-renderer.js";

import { v4 as uuidv4 } from "../../../lib/uuid-9.0.0.js";
import { db } from "../../db.js";

export default class RemoteSituation extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-direction: row;
          position: relative;
          height: 100%;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
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

        adc-table {
          flex-basis: 0;
          flex-grow: 1;
        }         

        adc-vbox:nth-of-type( 1 ) {
          background-color: #f4f4f4;
          min-width: 300px;
        }

        adc-vbox:nth-of-type( 2 ) {
          flex-basis: 0;
          flex-grow: 1;
          padding: 16px 0 0 0;
        }

        adc-vbox adc-hbox {
          gap: 16px;
          padding: 0 16px 0 16px;
        }

        adc-input:not( [type=search] ) {
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-spacer {
          --spacer-width: 61px;
        }

        adc-tabs {
          margin: 6px 16px 16px 16px;
        }

        adc-vbox[slot=empty] {
          align-items: center;
          justify-content: center;
        }

        adc-vbox[slot=empty] adc-label {
          --label-color: #525252;
        }

        adc-notes {
          padding: 16px;
        }
      </style>
      <adc-vbox>
        <adc-input 
          id="search"
          placeholder="Search reports" 
          size="lg" 
          type="search">
          <adc-icon name="search" slot="prefix"></adc-icon>
        </adc-input>
        <adc-table selectable sortable>
          <adc-column 
            header-text="Reports"
            item-renderer="arm-situation-item-renderer" 
            sortable>
          </adc-column>
          <adc-vbox slot="empty">
            <adc-label>No report added yet.</adc-label>
          </adc-vbox>
        </adc-table>
      </adc-vbox>
      <adc-vbox>
        <adc-hbox>
          <adc-avatar read-only shorten>
            <adc-icon name="person" filled slot="icon"></adc-icon>
          </adc-avatar>
          <adc-select
            label="Contributor"
            label-field="fullName"
            placeholder="Contributor"
            style="flex-basis: 0; flex-grow: 2;">
          </adc-select>
          <adc-date-picker
            label="Date"
            placeholder="Date"
            style="flex-basis: 0; flex-grow: 1;">
          </adc-date-picker>
        </adc-hbox>
        <adc-tabs>
          <arm-situation-details label="Progress" prompt="What has happened since your last report?"></arm-situation-details>
          <adc-notes description="What has happened since your last report?" id="progress" label="Progress" light monospace></adc-notes>
          <adc-notes description="What are you planning between now and your next report?" id="priorities" label="Priorities" light monospace></adc-notes>        
          <adc-notes description="Are you encountering any problems that might need attention?" id="problems" label="Problems" light monospace></adc-notes>        
        </adc-tabs>
        <adc-controls></adc-controls>
      </adc-vbox>
    `;

    // Private
    this._created = false;
    this._data = null;
    this._updated = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$avatar = this.shadowRoot.querySelector( 'adc-avatar' );
    this.$column = this.shadowRoot.querySelector( 'adc-column' );
    this.$column.sortCompareFunction = ( a, b ) => {
      if( a.startAt > b.startAt ) return 1;
      if( a.startAt < b.startAt ) return -1;
      return 0;
    };    
    this.$controls = this.shadowRoot.querySelector( 'adc-controls' );
    this.$controls.addEventListener( 'add', () => this.doControlsAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doControlsCancel() );
    this.$controls.addEventListener( 'delete', () => this.doControlsDelete() );
    this.$controls.addEventListener( 'edit', () => this.doControlsEdit() );
    this.$controls.addEventListener( 'save', () => this.doControlsSave() );    
    this.$contributor = this.shadowRoot.querySelector( 'adc-select' );
    this.$contributor.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;    
    this.$contributor.addEventListener( 'change', ( evt ) => {
      this.$avatar.label = evt.detail.selectedItem.fullName;      
      this.$avatar.value = evt.detail.selectedItem.avatar;
    } );
    this.$date = this.shadowRoot.querySelector( 'adc-date-picker' );
    this.$priorities = this.shadowRoot.querySelector( '#priorities' );    
    this.$problems = this.shadowRoot.querySelector( '#problems' );    
    this.$progress = this.shadowRoot.querySelector( '#progress' );
    this.$search = this.shadowRoot.querySelector( '#search' );
    this.$search.addEventListener( 'input', ( evt ) => this.doSearchInput( evt ) );
    this.$search.addEventListener( 'clear', ( evt ) => this.doSearchClear( evt ) );    
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) );  
    this.$table.selectedItemsCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;        

    this.doSituationLoad();
  }

  doControlsAdd() {
    window.localStorage.removeItem( 'remote_situation_id' );

    this.$table.selectedItems = null;
    this.value = null;
    this.readOnly = false;
    this.$contributor.focus();    
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;    
  }   

  doControlsCancel() {
    const id = window.localStorage.getItem( 'remote_situation_id' );
    
    this.readOnly = true;    

    if( id === null ) {
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;
    } else {
      db.Situation.where( {id: id} ).first()
      .then( ( item ) => {
        this.value = item;
        this.$controls.mode = AvocadoControls.ADD_EDIT;        
      } );
    }
  }    

  doControlsDelete() {
    const response = confirm( `Delete report?` );

    if( response ) {
      const id = window.localStorage.getItem( 'remote_situation_id' );
      
      window.localStorage.removeItem( 'remote_situation_id' );      

      db.Situation.delete( id )
      .then( () => db.Situation.orderBy( 'startAt' ).toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Reports (${results.length})`;      
        this.$table.selectedItems = null;        
        this.$table.provider = results;        
      } );          

      this.value = null;
      this.readOnly = true;
      this.$controls.mode = AvocadoControls.ADD_ONLY;            
    }
  }    

  doControlsEdit() {
    this.readOnly = false;    
    this.$contributor.focus();
    this.$controls.mode = AvocadoControls.DELETE_CANCEL_SAVE;    
  }  

  doControlsSave() {
    if( this.$contributor.selectedItem === null ) {
      this.$contributor.error = 'Contributor is a required field.';
      this.$contributor.invalid = true;
      return;
    } else {
      this.$contributor.error = null;
      this.$contributor.invalid = false;
    }

    if( this.$date.value === null ) {
      this.$date.error = 'Date is a required field.';
      this.$date.invalid = true;
      return;
    } else {
      this.$date.error = null;
      this.$date.invalid = false;
    }

    const record = Object.assign( {}, this.value );

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = window.localStorage.getItem( 'remote_situation_id' );
      record.createdAt = this._created;
      record.updatedAt = this._updated = Date.now();

      db.Situation.put( record )
      .then( () => db.Situation.orderBy( 'startAt' ).toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Reports (${results.length})`;      
        this.$table.provider = results;
        this.$table.selectedItems = [{id: record.id}];
      } );
    } else {
      const at = Date.now();
      const id = uuidv4();

      window.localStorage.setItem( 'remote_situation_id', id );

      record.id = id;
      record.createdAt = this._created = at;
      record.updatedAt = this._updated = at;

      db.Situation.put( record )
      .then( () => db.Situation.orderBy( 'startAt' ).toArray() )
      .then( ( results ) => {
        this.$column.hederText = `Reports (${results.length})`;              
        this.$table.provider = results;     
        this.$table.selectedItems = [{id: record.id}];
      } );            
    }

    this.readOnly = true;
    this.$controls.mode = AvocadoControls.ADD_EDIT;
  } 

  doSituationLoad() {
    this.readOnly = true;

    db.Person.orderBy( 'fullName' ).toArray()
    .then( ( people ) => {
      this.$contributor.provider = people;
      return db.Situation.orderBy( 'startAt' ).toArray();
    } )
    .then( ( reports ) => {
      this.$column.headerText = `Reports (${reports.length})`;      
      this.$table.provider = reports;  

      const id = window.localStorage.getItem( 'remote_situation_id' );

      if( id === null ) {
        this.value = null;
        this.$controls.mode = AvocadoControls.ADD_ONLY;        
      } else {
        this.$table.selectedItems = [{id: id}];      
        db.Situation.where( {id: id} ).first()
        .then( ( item ) => {
          this.value = item;
          this.$controls.mode = item === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;
        } );
      }
    } );    
  }

  doSearchClear() {
    db.Situation.orderBy( 'startAt' ).toArray()
    .then( ( results ) => {
      this.$column.headerText = `Reports (${results.length})`;      
      this.$table.provider = results;    

      const id = window.localStorage.getItem( 'remote_situation_id' );

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
    window.localStorage.removeItem( 'remote_situation_id' );

    db.Situation.orderBy( 'startAt' ).toArray()
    .then( ( results ) => {
      if( this.$search.value === null ) {
        this.doSearchClear();
        return;
      }

      if( results !== null ) {
        this.$table.provider = results.filter( ( value ) => {
          const term = this.$search.value.toLowerCase();          
  
          let progress = false;
          let priorities = false;
          let problems = false;
  
          if( value.progress !== null )
            if( value.progress.toLowerCase().indexOf( term ) >= 0 )
              progress = true;
  
          if( value.priorities !== null )
            if( value.priorities.toLowerCase().indexOf( term ) >= 0 )
              priorities = true;              

          if( value.problems !== null )
            if( value.problems.toLowerCase().indexOf( term ) >= 0 )
                problems = true;                            
  
          if( progress || priorities || problems )
            return true;
          
          return false;
        } );
      }

      this.$column.headerText = `Reports (${this.$table.provider === null ? 0 : this.$table.provider.length})`;              
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
      window.localStorage.removeItem( 'remote_situation_id' );
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;      
    } else {
      window.localStorage.setItem( 'remote_situation_id', evt.detail.selectedItem.id );
      db.Situation.where( {id: evt.detail.selectedItem.id} ).first()
      .then( ( item ) => {
        this.value = item;
        console.log( item );
      } );
      this.$controls.mode = AvocadoControls.ADD_EDIT;      
    }
  }

   // When attributes change
  _render() {
    this.$contributor.readOnly = this.readOnly;    
    this.$date.readOnly = this.readOnly;
    this.$progress.readOnly = this.readOnly;
    this.$priorities.readOnly = this.readOnly;
    this.$problems.readOnly = this.readOnly;
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
    this._upgrade( 'read-only' );        
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
      startAt: this.$date.value === null ? null : this.$date.value.getTime(),
      contributor: this.$contributor.selectedItem === null ? null : this.$contributor.selectedItem.id,      
      subject: this.$contributor.selectedItem === null ? null : this.$contributor.selectedItem.fullName,
      progress: this.$progress.value,
      priorities: this.$priorities.value,
      problems: this.$problems.value
    };
  }

  set value( data ) {
    if( data === null ) {
      this._created = null;
      this._updated = null;
      this.$avatar.value = null;
      this.$avatar.label = null;      
      this.$contributor.selectedItem = null;
      this.$contributor.error = null;
      this.$contributor.invalid = false;
      this.$date.value = null;
      this.$date.error = null;
      this.$date.invalid = false;
      this.$progress.value = null;
      this.$priorities.value = null;
      this.$problems.value = null;
    } else {
      db.Person.where( {id: data.contributor} ).first()
      .then( ( person ) => {
        this.$avatar.value = person.avatar;
        this.$avatar.label = person.fullName;
      } );

      this._created = data.createdAt;
      this._updated = data.updatedAt;
      this.$contributor.selectedItem = data.contributor === null ? null : {id: data.contributor};
      this.$contributor.error = null;
      this.$contributor.invalid = false;      
      this.$date.value = data.startAt === null ? null : new Date( data.startAt );
      this.$date.error = null;
      this.$date.invalid = false;      
      this.$progress.value = data.progress;
      this.$priorities.value = data.priorities;
      this.$problems.value = data.problems;      
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

window.customElements.define( 'arm-situation', RemoteSituation );
