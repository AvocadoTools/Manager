import AvocadoHBox from "../../../containers/hbox.js";
import AvocadoTabGroup from "../../../containers/tab-group.js";
import AvocadoVBox from "../../../containers/vbox.js";

import AvocadoActionBar from "../../../controls/action-bar.js";
import AvocadoButton from "../../../controls/button.js";
import AvocadoInput from "../../../controls/input.js";
import AvocadoTable from "../../../controls/table.js";

import RemotePersonAttachments from "./attachments.js";
import RemotePersonProfile from "./profile.js";

export default class RemotePerson extends HTMLElement {
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
          position: relative;
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

        adc-input {
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-table {
          background-color: #f4f4f4;
          min-width: 300px;
          width: 300px;
        }

        adc-tab-group {
          margin: 0 16px 16px 16px;
        }

        adc-vbox {
          flex-basis: 0;
          flex-grow: 1;
          padding: 16px 0 0 0;
        }
      </style>
      <adc-table>
        <adc-column header-text="People (0)" sortable></adc-column>
      </adc-table>
      <adc-vbox>
        <adc-hbox>
          <adc-input id="name" label="Full name" placeholder="Full name">
            <adc-label text="Send email"></adc-label>
          </adc-input>      
          <adc-input id="email" label="Email" placeholder="Email"></adc-input>        
        </adc-hbox>
        <adc-hbox>
          <adc-input id="title" label="Job title" placeholder="Job title"></adc-input>      
          <adc-input id="location" label="Location" placeholder="Location"></adc-input>        
        </adc-hbox>   
        <adc-tab-group>
          <arm-person-profile label="Profile"></arm-person-profile>
          <arm-person-attachments label="Attachments"></arm-person-attachments>
        </adc-tab-group>
        <adc-action-bar></adc-action-bar>
      </adc-vbox>
    `;

    // Private
    this._data = null;    

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$actions = this.shadowRoot.querySelector( 'adc-action-bar' );
    this.$actions.addEventListener( 'add', () => {
      this.readOnly = false;
      this.$actions.mode = AvocadoActionBar.CANCEL_SAVE;
    } );
    this.$actions.addEventListener( 'cancel', () => {
      this.readOnly = true;
      this.$actions.mode = AvocadoActionBar.ADD_ONLY;
    } );
    this.$email = this.shadowRoot.querySelector( '#email' );
    this.$location = this.shadowRoot.querySelector( '#location' );
    this.$name = this.shadowRoot.querySelector( '#name' );
    this.$title = this.shadowRoot.querySelector( '#title' );
  }

  // When attributes change
  _render() {
    this.$name.readOnly = this.readOnly;
    this.$email.readOnly = this.readOnly;
    this.$title.readOnly = this.readOnly;
    this.$location.readOnly = this.readOnly;
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

window.customElements.define( 'arm-person', RemotePerson );
