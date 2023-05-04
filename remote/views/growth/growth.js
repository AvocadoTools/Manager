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

import RemoteGrowthConversations from "./conversations.js";
import RemoteGrowthObjectives from "./objectives.js";
import RemoteGrowthPerformance from "./performance.js";
import RemoteGrowthPotential from "./potential.js";
import RemoteGrowthStrengths from "./strengths.js";

import AvocadoControls from "../../../comp/controls.js";

import { v4 as uuidv4 } from "../../../lib/uuid-9.0.0.js";

import { store } from "../../store.js";

export default class RemoteGrowth extends HTMLElement {
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
      </style>
      <adc-vbox>
        <adc-input 
          placeholder="Search plans" 
          size="lg" 
          type="search">
          <adc-icon name="search" slot="prefix"></adc-icon>
        </adc-input>
        <adc-table selectable sortable>
          <adc-column 
            header-text="Plans"
            item-renderer="arm-person-item-renderer" 
            sortable>
          </adc-column>
          <adc-vbox slot="empty">
            <adc-label>No plans added yet.</adc-label>
          </adc-vbox>
        </adc-table>
      </adc-vbox>
      <adc-vbox>
        <adc-hbox>
          <adc-avatar read-only shorten>
            <adc-icon name="person" filled slot="icon"></adc-icon>
          </adc-avatar>
          <adc-select
            label="Person"
            placeholder="Person"
            style="flex-basis: 0; flex-grow: 1;">
          </adc-select>
          <adc-input
            label="Job level"
            placeholder="Job level"
            style="flex-grow: 0; min-width: 165px;"
            value="4">
          </adc-input>
          <adc-date-picker
            label="Last promotion date"
            placeholder="Last promotion date"
            style="flex-grow: 0; min-width: 200px;">
          </adc-date-picker>                           
        </adc-hbox>
        <adc-tabs>
          <arm-growth-objectives label="Goals"></arm-growth-objectives>
          <arm-growth-strengths label="Strengths"></arm-growth-strengths>
          <arm-growth-performance label="Performance"></arm-growth-performance>                    
          <arm-growth-potential label="Potential"></arm-growth-potential>          
          <arm-growth-conversations label="Conversations"></arm-growth-conversations>
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
    this.$controls = this.shadowRoot.querySelector( 'adc-controls' );
    this.$controls.addEventListener( 'add', () => this.doPersonAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doPersonCancel() );
    this.$controls.addEventListener( 'delete', () => this.doPersonDelete() );
    this.$controls.addEventListener( 'edit', () => this.doPersonEdit() );
    this.$controls.addEventListener( 'save', () => this.doPersonSave() );
    this.$level = this.shadowRoot.querySelector( 'adc-input' );    
    this.$person = this.shadowRoot.querySelector( 'adc-select' );    
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.value = evt.detail.selectedItem === null ? null : evt.detail.selectedItem );
    // this.$name.addEventListener( 'input', () => this._changed = true );

    // State
    store.person.subscribe( ( data ) => {
      this.$column.headerText = `Plans (${data.length})`;
      this.$table.provider = data.sort( ( a, b ) => {
        if( a.fullName.toLowerCase() > b.fullName.toLowerCase() ) return 1;
        if( a.fullName.toLowerCase() < b.fullName.toLowerCase() ) return -1;
        return 0;
      } );
    } );
  }

  clear() {
    this.$person.error = null;
    this.$person.invalid = false;
  }

  doNameChange() {
    if( this.$avatar.src === null ) {
      this.$avatar.label = this.$person.selectedItem.fullName;
    }
  }

  doPersonAdd() {
    this.$controls.mode = RemoteControls.CANCEL_SAVE;
    this.value = null;
    this.clear();
    this._changed = false;
    this.readOnly = false;
    this.$person.focus();
  }

  doPersonCancel() {
    if( this._changed ) {
      const response = confirm( 'Do you want to save changes?' );
      
      if( response ) {
        this.doPersonSave();
        this._changed = false;
        return;
      }
    }

    if( this._value === null ) {
      this.clear();
      this.$controls.mode = RemoteControls.ADD_ONLY;
    } else {
      this.value = this._value;
      this.$controls.mode = RemoteControls.ADD_EDIT;
    }

    this.readOnly = true;    
    this._changed = false;
  }

  doPersonDelete() {
    const response = confirm( `Delete ${this._value.fullName}?` );

    if( response ) {
      this.value = null;
      this._changed = false;
      this.readOnly = true;
      this.$controls.mode = RemoteControls.ADD_ONLY;
    }
  }
  
  doPersonEdit() {
    this._changed = false;
    this.readOnly = false;
    this.$controls.mode = this._value === null ? RemoteControls.ADD_EDIT : RemoteControls.DELETE_CANCEL_SAVE;
    this.$name.focus();
  }

  doPersonSave() {
    if( this.$name.value === null ) {
      this.$name.error = 'A full name is the only required field.';
      this.$name.invalid = true;
      return;
    } else {
      this.$name.error = null;
      this.$name.invalid = false;
    }

    const record = {
      fullName: this.$name.value,
      email: this.$email.value,
      jobTitle: this.$title.value,
      location: this.$location.value
    };  

    if( this.$controls.mode === RemoteControls.DELETE_CANCEL_SAVE ) {
      record.id = this.value.id;
      record.createdAt = this.value.createdAt;
      record.updatedAt = Date.now();

      this.dispatchEvent( new CustomEvent( 'edit', {
        detail: {
          type: 'person',
          value: record
        }
      } ) );
    } else {
      const at = Date.now();

      record.id = uuidv4();
      record.createdAt = at;
      record.updatedAt = at;

      this.dispatchEvent( new CustomEvent( 'add', {
        detail: {
          type: 'person',
          value: record
        }
      } ) );
    }

    this._changed = false;
    this.readOnly = true;
    this.$controls.mode = RemoteControls.ADD_EDIT;
  }

   // When attributes change
  _render() {
    this.$avatar.readOnly = this.readOnly;
    this.$level.readOnly = this.readOnly;
    this.$person.readOnly = this.readOnly;
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

window.customElements.define( 'arm-growth', RemoteGrowth );
