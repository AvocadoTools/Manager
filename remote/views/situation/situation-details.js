import AvocadoHBox from "../../../containers/hbox.js";
import AvocadoVBox from "../../../containers/vbox.js";

import AvocadoColumn from "../../../controls/column.js";
import AvocadoIcon from "../../../controls/icon.js";
import AvocadoInput from "../../../controls/input.js";
import AvocadoLabel from "../../../controls/label.js";
import AvocadoSelect from "../../../controls/select.js";
import AvocadoTable from "../../../controls/table.js";

export default class RemoteSituationDetails extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-basis: 0;
          flex-direction: row;
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
      <adc-vbox>
        <adc-hbox>
          <adc-input light placeholder="Item description"></adc-input>            
          <adc-button label="Add item" size="md"></adc-button>
        </adc-hbox>
        <adc-vbox id="header">
          <adc-input 
            id="search"
            placeholder="Search items" 
            size="lg" 
            type="search">
            <adc-icon name="search" slot="prefix"></adc-icon>
          </adc-input>
          <adc-hbox style="align-items: center; gap: 0; padding: 0 16px 0 32px;">
            <adc-label style="flex-grow: 1;">1 item selected</adc-label>
            <adc-button id="up" label="Move up">
              <adc-icon name="arrow_upward" slot="suffix"></adc-icon>
            </adc-button>          
            <adc-button id="down" label="Move down">
              <adc-icon name="arrow_downward" slot="suffix"></adc-icon>
            </adc-button>
            <div id="divider">
              <div></div>
            </div>            
            <adc-button id="delete" label="Delete">
              <adc-icon name="delete" slot="suffix"></adc-icon>
            </adc-button>
          </adc-hbox>      
        </adc-vbox>            
        <adc-table light style="padding: 0 16px 0 16px;">
          <adc-column header-text="Item"></adc-column>
          <adc-vbox slot="empty">
            <adc-label>No items added yet.</adc-label>
          </adc-vbox>                                                      
        </adc-table>
      </adc-vbox>
      <!--
      <adc-notes description="What has happened since your last report?" id="progress" label="Progress" light monospace></adc-notes>
      <adc-notes description="What are you planning between now and your next report?" id="priorities" label="Priorities" light monospace></adc-notes>        
      <adc-notes description="Are you encountering any problems that might need attention?" id="problems" label="Problems" light monospace></adc-notes>        
      -->
    `;

    // Private
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$column = this.shadowRoot.querySelector( 'adc-column' );
    this.$column.sortCompareFunction = ( a, b ) => {
      if( a.startAt > b.startAt ) return 1;
      if( a.startAt < b.startAt ) return -1;
      return 0;
    };    
    this.$input = this.shadowRoot.querySelector( 'adc-input' );
    this.$table = this.shadowRoot.querySelector( 'adc-table' );
    this.$table.addEventListener( 'change', ( evt ) => this.doTableChange( evt ) );  
    this.$table.selectedItemsCompareFunction = ( provider, item ) => provider.id === item.id ? true : false;
  }

   // When attributes change
  _render() {
    // this.$progress.readOnly = this.readOnly;
    this.$input.label = this.prompt === null ? '' : this.prompt;
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
    this._upgrade( 'prompt' );                
    this._upgrade( 'read-only' );        
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
      'prompt',      
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
    return;
  }

  set value( data ) {
    if( data === null ) {

    } else {

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

  get prompt() {
    if( this.hasAttribute( 'prompt' ) ) {
      return this.getAttribute( 'prompt' );
    }

    return null;
  }

  set prompt( value ) {
    if( value !== null ) {
      this.setAttribute( 'prompt', value );
    } else {
      this.removeAttribute( 'prompt' );
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

window.customElements.define( 'arm-situation-details', RemoteSituationDetails );
