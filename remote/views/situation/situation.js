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

import RemoteSituationItemRender from "./situation-item-renderer.js";

import { v4 as uuidv4 } from "../../../lib/uuid-9.0.0.js";

import { db } from "../../db.js";
import { store } from "../../store.js";

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
          margin: 0 16px 16px 16px;
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
          placeholder="Search situations" 
          size="lg" 
          type="search">
          <adc-icon name="search" slot="prefix"></adc-icon>
        </adc-input>
        <adc-table selectable sortable>
          <adc-column 
            header-text="Situations"
            item-renderer="arm-situation-item-renderer" 
            sortable>
          </adc-column>
          <adc-vbox slot="empty">
            <adc-label>No situations added yet.</adc-label>
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
          <adc-notes description="What has happened since your last report?" id="progress" label="Progress" light monospace></adc-notes>
          <adc-notes description="What are you planning between now and your next report?" id="priorities" label="Priorities" light monospace></adc-notes>        
          <adc-notes description="Are you encountering any problems that might need attention?" id="problems" label="Problems" light monospace></adc-notes>        
        </adc-tabs>
        <adc-controls></adc-controls>
      </adc-vbox>
    `;

    // Private
    this._changed = false;
    this._data = null;
    this._value = null;

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
    this.$controls.addEventListener( 'add', () => this.doAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doCancel() );
    this.$controls.addEventListener( 'delete', () => this.doDelete() );
    this.$controls.addEventListener( 'edit', () => this.doEdit() );
    this.$controls.addEventListener( 'save', () => this.doSave() );    
    this.$contributor = this.shadowRoot.querySelector( 'adc-select' );
    this.$contributor.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;    
    this.$contributor.addEventListener( 'change', ( evt ) => {
      const avatar = this.avatar( evt.detail.selectedItem.id );
      this.$avatar.label = avatar.label;      
      this.$avatar.src = avatar.src;
    } );
    this.$date = this.shadowRoot.querySelector( 'adc-date-picker' );
    this.$priorities = this.shadowRoot.querySelector( '#priorities' );    
    this.$problems = this.shadowRoot.querySelector( '#problems' );    
    this.$progress = this.shadowRoot.querySelector( '#progress' );
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) );  

    // State
    const index = window.localStorage.getItem( 'remote_situation_index' ) === null ? null : parseInt( window.localStorage.getItem( 'remote_situation_index' ) );

    store.person.subscribe( ( data ) => {
      this.$contributor.provider = data      
    } );    

    // Read
    db.Situation.orderBy( 'startAt' ).reverse().toArray()
    .then( ( results ) => {
      this.$column.headerText = `Situations (${results.length})`;      
      this.$table.provider = results;      
      this.$table.selectedIndex = index === null ? null : index;      

      this.readOnly = true;
      this.value = index === null ? null : results[index];      
      this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;      
      
      store.situation.set( results );
    } );
  }

  avatar( id ) {
    const matches = store.person.value.filter( ( item ) => item.id === id ? true : false );  
    console.log( 'STORE_PERSON' );
    console.log( store.person.value );

    const result = {
      src: matches.length === 0 ? null : matches[0].avatar,
      label: null
    };

    if( matches.length > 0 ) {
      if( matches[0].hasOwnProperty( 'avatar' ) ) {
        result.label = matches[0].avatar === null ? matches[0].fullName : null;
      }
    }

    return result;
  }  

  clear() {
    this.$avatar.clear();
    this.$contributor.value = null;
    this.$date.value = null;
    this.$progress.value = null;
    this.$priorities.value = null;
    this.$problems.value = null;    
  }  

  doAdd() {
    this.$table.selectedIndex = null;
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;
    this.value = null;
    this.clear();
    this._changed = false;
    this.readOnly = false;
    this.$contributor.focus();
  }

  doCancel() {
    if( this._changed ) {
      const response = confirm( 'Do you want to save changes?' );
      
      if( response ) {
        this.doSave();
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

  doDelete() {
    const id = this._value.id;    
    const response = confirm( `Delete this situation?` );

    if( response ) {
      this.clear();
      this.value = null;
      this.$table.selectedIndex = null;
      window.localStorage.removeItem( 'remote_situation_index' );
      this._changed = false;
      this.readOnly = true;
      this.$controls.mode = AvocadoControls.ADD_ONLY;

      db.Situation.delete( id )
      .then( () => db.Situation.orderBy( 'startAt' ).reverse().toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Situations (${results.length})`;      
        this.$table.provider = results;        
        store.conversation.set( results );
      } );          
    }
  }  

  doEdit() {
    this._changed = false;
    this.readOnly = false;
    this.$controls.mode = this._value === null ? AvocadoControls.ADD_EDIT : AvocadoControls.DELETE_CANCEL_SAVE;
    this.$contributor.focus();
  }

  doSave() {
    if( this.$contributor.value === null ) {
      this.$contributor.error = 'Situations must have an contributor.';
      this.$contributor.invalid = true;
      return;
    } else {
      this.$contributor.error = null;
      this.$contributor.invalid = false;
    }

    if( this.$date.value === null ) {
      this.$date.error = 'Situation date is a required field.';
      this.$date.invalid = true;
      return;
    } else {
      this.$date.error = null;
      this.$date.invalid = false;
    }        

    const record = {
      contributor: this.$contributor.value.id,
      startAt: this.$date.value.getTime(),
      progress: this.$progress.value,
      priorities: this.$priorities.value,
      problems: this.$problems.value,
      subject: this.$contributor.value.fullName
    };  

    if( this.$controls.mode === AvocadoControls.DELETE_CANCEL_SAVE ) {
      record.id = this.value.id;
      record.createdAt = this.value.createdAt;
      record.updatedAt = Date.now();
      this.value = record;                

      db.Situation.put( record )
      .then( () => db.Situation.orderBy( 'startAt' ).reverse().toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Situations (${results.length})`;      
        this.$table.provider = results;

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$table.selectedIndex = r;
            window.localStorage.setItem( 'remote_situation_index', r );
            break;
          }
        }

        store.situation.set( results );
      } );
    } else {
      const at = Date.now();

      record.id = uuidv4();
      record.createdAt = at;
      record.updatedAt = at;
      this.value = record;

      db.Situation.put( record )
      .then( () => db.Situation.orderBy( 'startAt' ).reverse().toArray() )
      .then( ( results ) => {
        this.$column.headerText = `Situations (${results.length})`;              
        this.$table.provider = results;     

        for( let r = 0; r < results.length; r++ ) {
          if( results[r].id === record.id ) {
            this.$table.selectedIndex = r;
            window.localStorage.setItem( 'remote_situation_index', r );
            break;
          }
        }

        store.situation.set( results );
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
        this.doSave();
      }
    }

    this.readOnly = true;
    this.value = evt.detail.selectedItem === null ? null : evt.detail.selectedItem;      
    this.$controls.mode = this.value === null ? AvocadoControls.ADD_ONLY : AvocadoControls.ADD_EDIT;

    if( evt.detail.selectedItem === null ) {
      window.localStorage.removeItem( 'remote_situation_index' );
    } else {
      window.localStorage.setItem( 'remote_situation_index', evt.detail.selectedIndex );      
    }
  }    

   // When attributes change
  _render() {
    this.$contributor.readOnly = this.readOnly;    
    this.$date.readOnly = this.readOnly;
    this.$progress.readOnly = this.readOnly;
    this.$priorities.readOnly = this.readOnly;
    this.$problems.readOnly = this.readOnly;

    if( this.value === null ) {
      this.$avatar.src = null;      
      this.$avatar.label = null;            

      this.$date.value = null;   
    } else {
      console.log( 'AVATAR_CONTRIBUTOR' );
      console.log( this.value );
      let avatar = this.avatar( this.value.contributor );
      this.$avatar.label = avatar.label;
      this.$avatar.src = avatar.src;

      this.$date.value = this.value.startAt === null ? null : this.value.startAt;
    }    

    this.$contributor.selectedItem = this._value === null ? null : {id: this._value.contributor};            
    this.$progress.value = this._value === null ? null : this._value.progress;
    this.$priorities.value = this._value === null ? null : this._value.priorities;
    this.$problems.value = this._value === null ? null : this._value.problems;
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

window.customElements.define( 'arm-situation', RemoteSituation );
