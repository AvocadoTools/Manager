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
import RemoteGrowthGoals from "./goals.js";
import RemoteGrowthPerformance from "./performance.js";
import RemoteGrowthPotential from "./potential.js";
import RemoteGrowthStrengths from "./strengths.js";

import AvocadoControls from "../../../comp/controls.js";

import { v4 as uuidv4 } from "../../../lib/uuid-9.0.0.js";
import { db } from "../../db.js";

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

        adc-vbox {
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
        <adc-hbox>
          <adc-avatar read-only shorten>
            <adc-icon name="person" filled slot="icon"></adc-icon>
          </adc-avatar>
          <adc-select
            id="person"
            label="Person"
            label-field="fullName"
            placeholder="Person"
            style="flex-basis: 0; flex-grow: 0; min-width: 300px;">
          </adc-select>
          <adc-input
            id="scope"
            label="Job scope"
            placeholder="Job scope">
          </adc-input>          
          <adc-input
            id="level"
            label="Job level"
            placeholder="Job level"
            style="flex-grow: 0; min-width: 165px;"
            value="4">
          </adc-input>
          <adc-date-picker
            id="promotion"
            label="Last promotion date"
            placeholder="Promotion date"
            style="flex-grow: 0; min-width: 165px;">
          </adc-date-picker>                           
        </adc-hbox>
        <adc-tabs>
          <arm-growth-conversations label="Conversations"></arm-growth-conversations>        
          <arm-growth-goals label="Goals"></arm-growth-goals>
          <arm-growth-strengths label="Activities"></arm-growth-strengths>
          <arm-growth-performance label="Performance"></arm-growth-performance>                    
          <arm-growth-potential label="Potential"></arm-growth-potential>          
        </adc-tabs>
        <adc-controls concealed mode="5"></adc-controls>
      </adc-vbox>
    `;

    // Private
    this._created = null;
    this._data = null;
    this._updated = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$avatar = this.shadowRoot.querySelector( 'adc-avatar' );
    this.$controls = this.shadowRoot.querySelector( 'adc-controls' );
    this.$controls.addEventListener( 'add', () => this.doPersonAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doPersonCancel() );
    this.$controls.addEventListener( 'delete', () => this.doPersonDelete() );
    this.$controls.addEventListener( 'edit', () => this.doPersonEdit() );
    this.$controls.addEventListener( 'save', () => this.doPersonSave() );
    this.$conversations = this.shadowRoot.querySelector( 'arm-growth-conversations' );
    this.$level = this.shadowRoot.querySelector( '#level' );    
    this.$objectives = this.shadowRoot.querySelector( 'arm-growth-objectives' );
    this.$person = this.shadowRoot.querySelector( 'adc-select' );    
    this.$person.addEventListener( 'change', ( evt ) => {
      console.log( evt.detail );
    } );
    this.$promotion = this.shadowRoot.querySelector( '#promotion' );
    this.$scope = this.shadowRoot.querySelector( '#scope' );

    this.doGrowthLoad();
  }

  doGrowthLoad() {
    this.readOnly = true;
  }

  clear() {
    this.value = null;
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
    const response = confirm( `Delete plan for ${this._value.fullName}?` );

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
    this.$level.readOnly = this.readOnly;
    this.$scope.readOnly = this.readOnly;
    this.$promotion.readOnly = this.readOnly;
    this.$conversations.readOnly = this.readOnly;
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
    this._upgrade( 'changed' );
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
      'changed',
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
      person: this.$person.selectedItem.id,
      level: this.$level.value,
      promotionAt: this.$promotion.value.getTime()
    };
  }

  set value( data ) {
    this.$person.selectedItem = {id: data.person};
    this.$level.value = data.level;
    this.$promotionAt.value = data.promotionAt === null ? null : new Date( data.promotionAt );
  }

  // Attributes
  // Reflected
  // Boolean, Number, String, null
  get changed() {
    return this.hasAttribute( 'changed' );
  }

  set changed( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'changed' );
      } else {
        this.setAttribute( 'changed', '' );
      }
    } else {
      this.removeAttribute( 'changed' );
    }
  }

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
