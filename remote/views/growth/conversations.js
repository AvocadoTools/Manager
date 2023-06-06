import AvocadoHBox from "../../../containers/hbox.js";

import AvocadoButton from "../../../controls/button.js";
import AvocadoColumn from "../../../controls/column.js";
import AvocadoDatePicker from "../../../controls/date-picker.js";
import AvocadoSpacer from "../../../controls/spacer.js";
import AvocadoSelect from "../../../controls/select.js";
import AvocadoTable from "../../../controls/table.js";
import AvocadoTextarea from "../../../controls/textarea.js";

export default class RemoteGrowthConversations extends HTMLElement {
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
          padding: 16px 16px 26px 16px;
          position: relative;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        adc-button {
          margin: 0 0 24px 0;
        }

        adc-controls {
          margin: 0 0 16px 0;
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
      </style>
      <adc-hbox>
        <adc-date-picker
          label="Date"
          light
          placeholder="Date"
          style="flex-grow: 0; min-width: 200px;">
        </adc-date-picker>                 
        <adc-input
          label="Objective"
          light
          placeholder="Objective"
          style="flex-basis: 0; flex-grow: 1;">
        </adc-input>        
      </adc-hbox>                        
      <adc-hbox>
        <adc-textarea
          label="Notes"
          light
          placeholder="Notes"
          style="height: 125px; width: 100%;">
        </adc-textarea>                  
      </adc-hbox>
      <adc-controls></adc-controls>
      <adc-table light selectable sortable>
        <adc-column header-text="Date" sortable width="216"></adc-column>        
        <adc-column header-text="Objective"></adc-column>                
      </adc-table>
    `;

    // Private
    this._created = null;
    this._data = null;
    this._updated = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Element
    this.$controls = this.shadowRoot.querySelector( 'adc-controls' );
    this.$controls = this.shadowRoot.querySelector( 'adc-controls' );
    this.$controls.addEventListener( 'add', () => this.doControlsAdd() );
    this.$controls.addEventListener( 'cancel', () => this.doControlsCancel() );
    this.$controls.addEventListener( 'delete', () => this.doControlsDelete() );
    this.$controls.addEventListener( 'edit', () => this.doControlsEdit() );
    this.$controls.addEventListener( 'save', () => this.doControlsSave() );        
    this.$date = this.shadowRoot.querySelector( 'adc-date-picker' );
    this.$notes = this.shadowRoot.querySelector( 'adc-textarea' );    
    this.$objective = this.shadowRoot.querySelector( 'adc-input' );
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) );    

    this.doConversationsLoad();
  }

  doControlsAdd() {
    window.localStorage.removeItem( 'remote_conversations_id' );

    this.$table.selectedItems = null;
    this.value = null;
    this.readOnly = false;
    this.$date.focus();    
    this.$controls.mode = AvocadoControls.CANCEL_SAVE;    
  }  

  doControlsCancel() {
    const id = window.localStorage.getItem( 'remote_conversations_id' );
    
    this.readOnly = true;    

    if( id === null ) {
      this.value = null;
      this.$controls.mode = AvocadoControls.ADD_ONLY;
    } else {
      db.Meeting.where( {id: id} ).first()
      .then( ( item ) => {
        this.value = item;
        this.$controls.mode = AvocadoControls.ADD_EDIT;        
      } );
    }
  }    

  doConversationsLoad() {

  }

   // When attributes change
  _render() {
    this.$date.readOnly = this.readOnly;    
    this.$notes.readOnly = this.readOnly;
    this.$objective.readOnly = this.readOnly;    
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

window.customElements.define( 'arm-growth-conversations', RemoteGrowthConversations );
