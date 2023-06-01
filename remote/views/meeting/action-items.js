import AvocadoHBox from "../../../containers/hbox.js";
import AvocadoVBox from "../../../containers/vbox.js";

import AvocadoButton from "../../../controls/button.js";
import AvocadoColumn from "../../../controls/column.js";
import AvocadoDatePicker from "../../../controls/date-picker.js";
import AvocadoInput from "../../../controls/input.js";
import AvocadoLabel from "../../../controls/label.js";
import AvocadoSelect from "../../../controls/select.js";
import AvocadoTable from "../../../controls/table.js";

import { db } from "../../db.js";

export default class RemoteMeetingActions extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-basis: 0;
          flex-direction: column;
          flex-grow: 1;
          padding: 16px 16px 16px 16px;
          position: relative;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        div[id=divider] {
          align-items: center;
          background-color: #0f62fe;
          display: flex;
          flex-direction: row;
          height: 48px;
        }

        div[id=divider] div {
          background-color: #ffffff;
          height: 15px;
          width: 1px;
        }

        adc-button {
          margin: 0 0 20px 0;
        }

        adc-button[kind="secondary"]::part( button ) {
          padding: 0 52px 0 15px;
        }        

        adc-button[disabled] adc-icon {
          --icon-color: #8d8d8d;
        }        

        adc-controls {
          padding-bottom: 16px;
        }

        adc-hbox {
          align-items: flex-end;
          gap: 16px;
        }

        adc-input {
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-table {
          flex-basis: 0;
          flex-grow: 1;
        }        

        adc-vbox adc-hbox {
          height: 48px;
          justify-content: flex-end;
          min-height: 48px;
          transition: transform 150ms ease-in-out;
        }

        adc-vbox adc-hbox adc-button {
          margin: 0;
        }

        adc-vbox adc-hbox adc-input::part( error ) {
          display: none;
        }

        adc-vbox adc-hbox adc-input::part( input ) {
          height: 48px;
        }        

        adc-vbox adc-hbox adc-input::part( field ) {
          border-bottom: none;
        }
        
        adc-vbox[id=header] {
          height: 48px;
          max-height: 48px;          
          min-height: 48px;
          overflow: hidden;
        }        

        adc-vbox[id=header] adc-hbox {
          gap: 0;
        }

        adc-vbox[id=header] adc-hbox:last-of-type {
          align-items: center;          
          background-color: #0f62fe;
          padding: 0 0 0 15px;
        }

        adc-vbox[id=header] adc-label {
          flex-basis: 0;
          flex-grow: 1;
          --label-color: #ffffff;
        }

        adc-vbox.selected adc-hbox:first-of-type {
          transform: translateY( 48px );
        }

        adc-vbox.selected adc-hbox:last-of-type {
          transform: translateY( -48px );
        }                       

        adc-vbox[slot=empty] {
          align-items: center;
          background-color: #ffffff;
          flex-basis: 0;
          flex-grow: 1;
          justify-content: center;
        }

        adc-vbox[slot=empty] adc-label {
          --label-color: #525252;
        }        
      </style>
      <adc-hbox>
        <adc-select
          label="Action owner"
          label-field="fullName"
          light
          name="owner"
          placeholder="Action owner"
          style="flex-grow: 0; min-width: 245px;">
        </adc-select>                                   
        <adc-input
          label="Description"
          light
          placeholder="Description">
        </adc-input>                
        <adc-button kind="secondary" label="Add action" size="md">
        </adc-button>
      </adc-hbox>
      <adc-vbox id="header">
        <adc-hbox>
          <adc-input 
            placeholder="Filter by attendee name" 
            size="lg" 
            type="search">
            <adc-icon name="search" slot="prefix"></adc-icon>
          </adc-input>
          <adc-button id="all" label="Email all">
            <adc-icon name="mail" slot="suffix"></adc-icon>
          </adc-button>                    
        </adc-hbox>
        <adc-hbox>
          <adc-label>1 attendee selected</adc-label>
          <adc-button id="email" label="Email">
            <adc-icon name="mail" slot="suffix"></adc-icon>
          </adc-button>          
          <adc-button id="delete" label="Delete">
            <adc-icon name="delete" slot="suffix"></adc-icon>
          </adc-button>
          <div id="divider">
            <div></div>
          </div>
          <adc-button id="cancel" label="Cancel"></adc-button>
        </adc-hbox>      
      </adc-vbox>
      <adc-table light selectable sortable>
        <adc-column header-text="Action Owner" label-field="fullName" sortable width="266"></adc-column>              
        <adc-column header-text="Description" label-field="description"></adc-column>
        <adc-vbox slot="empty">
          <adc-label>No actions added yet.</adc-label>
        </adc-vbox>                                        
      </adc-table>
    `;

    // Private
    this._data = null;
    this._index = null;
    this._items = [];

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Element
    this.$all = this.shadowRoot.querySelector( '#all' );    
    this.$description = this.shadowRoot.querySelector( 'adc-input' );
    this.$owner = this.shadowRoot.querySelector( 'adc-select[name=owner]' );
    this.$owner.selectedItemCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;    
    this.$button = this.shadowRoot.querySelector( 'adc-button' );
    this.$button.addEventListener( 'click', () => {
      if( this.$owner.value === null ) {
        this.$owner.error = 'An owner must be selected.';
        this.$owner.invalid = true;
        return;
      } else {
        this.$owner.error = null;
        this.$owner.invalid = false;
      }

      if( this.$description.value === null ) {
        this.$description.error = 'An description must be provided.';
        this.$description.invalid = true;
        return;
      } else {
        this.$description.error = null;
        this.$description.invalid = false;
      }      
     
      this._items.push( {
        id: this.$owner.selectedItem.id,
        fullName: this.$owner.selectedItem.fullName,
        description: this.$description.value
      } );

      this.$owner.selectedItem = null;
      this.$description.value = null;
      this.label = `Actions (${this._items.length})`;    
      this.$table.provider = this._items;                    
    } );
    this.$cancel  = this.shadowRoot.querySelector( '#cancel' );
    this.$cancel.addEventListener( 'click', () => {
      this.$table.selectedIndices = null;
      this.$header.classList.remove( 'selected' );
    } );
    this.$column = this.shadowRoot.querySelector( 'adc-column' );
    this.$column.sortCompareFunction = ( a, b ) => {
      if( a.fullName.toLowerCase() > b.fullName.toLowerCase() ) return 1;
      if( a.fullName.toLowerCase() < b.fullName.toLowerCase() ) return -1;
      return 0;
    };    
    this.$delete = this.shadowRoot.querySelector( '#delete' );
    this.$delete.addEventListener( 'click', () => {
      this.$header.classList.remove( 'selected' );
      this._items.splice( this._index, 1 );
      this.label = `Actions (${this._items.length})`;    
      this._index = null;
      this.$header.classList.remove( 'selected' );  
      this.$table.selectedItems = null;
      this.$table.provider = this._items;
    } );    
    this.$header = this.shadowRoot.querySelector( 'adc-vbox' );
    this.$search = this.shadowRoot.querySelector( 'adc-input[type=search]' );
    this.$search.addEventListener( 'clear', () => {
      this.$table.provider = this._items;
    } );
    this.$search.addEventListener( 'input', ( evt ) => {
      if( evt.currentTarget.value === null ) {
        this.$table.provider = this._items;
      } else {
        this.$table.provider = this._items.filter( ( item ) => {
          const name = item.fullName.toLowerCase().indexOf( evt.currentTarget.value.toLowerCase() ) >= 0 ? true : false;
          const description = item.description.toLowerCase().indexOf( evt.currentTarget.value.toLowerCase() ) >= 0 ? true : false;        
          return name || description;
        } );
      }
    } );        
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => {
      this._index = evt.detail.selectedIndex;

      if( this.$table.selectedIndices.length > 0 ) {
        this.$header.classList.add( 'selected' );
      } else {
        this.$header.classList.remove( 'selected' );
      }
    } );    

    this.doActionsLoad();    
  }

  doActionsLoad() {
    this.readOnly = true;
    db.Person.orderBy( 'fullName' ).toArray()
    .then( ( data ) => this.$owner.provider = data );
  }  

   // When attributes change
  _render() {
    this.$all.disabled = this._items.length === 0 ? true : false;    
    this.$description.readOnly = this.readOnly;
    this.$owner.readOnly = this.readOnly;
    this.$button.disabled = this.readOnly;
    this.$delete.hidden = this.readOnly;    
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
    this._upgrade( 'disabled' );
    this._upgrade( 'helper' );
    this._upgrade( 'hidden' );
    this._upgrade( 'icon' );
    this._upgrade( 'label' );
    this._upgrade( 'readOnly' );
    this._upgrade( 'value' );    
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'disabled',
      'helper',
      'hidden',
      'icon',
      'label',
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
    return this._items.length === 0 ? null : this._items;
  }

  set value( data ) {
    if( data === null ) {
      this._items = [];
    } else {
      this._items = [... data];
    }

    this.$owner.selectedItem = null;
    this.$owner.error = null;
    this.$owner.invalid = false;
    this.$description.value = null;
    this.$description.error = null;
    this.$description.invalid = false;
    this.$search.value = null;
    this.$header.classList.remove( 'selected' );
    this.$table.selectedItems = null;
    this.$table.provider = this._items;
    this.label = `Actions (${this._items.length})`;
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

  get disabled() {
    return this.hasAttribute( 'disabled' );
  }

  set disabled( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'disabled' );
      } else {
        this.setAttribute( 'disabled', '' );
      }
    } else {
      this.removeAttribute( 'disabled' );
    }
  }

  get helper() {
    if( this.hasAttribute( 'helper' ) ) {
      return this.getAttribute( 'helper' );
    }

    return null;
  }

  set helper( value ) {
    if( value !== null ) {
      this.setAttribute( 'helper', value );
    } else {
      this.removeAttribute( 'helper' );
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

  get icon() {
    if( this.hasAttribute( 'icon' ) ) {
      return this.getAttribute( 'icon' );
    }

    return null;
  }

  set icon( value ) {
    if( value !== null ) {
      this.setAttribute( 'icon', value );
    } else {
      this.removeAttribute( 'icon' );
    }
  }

  get label() {
    if( this.hasAttribute( 'label' ) ) {
      return this.getAttribute( 'label' );
    }

    return null;
  }

  set label( value ) {
    if( value !== null ) {
      this.setAttribute( 'label', value );
    } else {
      this.removeAttribute( 'label' );
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

window.customElements.define( 'arm-meeting-actions', RemoteMeetingActions );
