import AvocadoButton from "../controls/button.js";
import AvocadoSpacer from "../controls/spacer.js";

export default class AvocadoControls extends HTMLElement {
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
        }

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }
      </style>
      <adc-button label="Add">
        <adc-icon name="add" slot="suffix"></adc-icon>
      </adc-button>
      <adc-button kind="danger" label="Delete">
        <adc-icon name="delete" slot="suffix"></adc-icon>
      </adc-button>      
      <adc-spacer></adc-spacer>
      <adc-button kind="secondary" label="Cancel">
        <adc-icon name="cancel" slot="suffix"></adc-icon>
      </adc-button>            
      <adc-button label="Save">
        <adc-icon name="save" slot="suffix"></adc-icon>
      </adc-button>                  
      <adc-button label="Edit">
        <adc-icon name="edit" slot="suffix"></adc-icon>
      </adc-button>             
    `;

    // Private
    this._data = null;    
    this._touch = ( 'ontouchstart' in document.documentElement ) ? 'touchstart' : 'click';            

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$add = this.shadowRoot.querySelector( 'adc-button:nth-of-type( 1 )' );
    this.$add.addEventListener( this._touch, ( evt ) => { 
      evt.preventDefault();
      this.dispatchEvent( new CustomEvent( 'add' ) ); 
    } );
    this.$cancel = this.shadowRoot.querySelector( 'adc-button:nth-of-type( 3 )' );    
    this.$cancel.addEventListener( this._touch, ( evt ) => { 
      evt.preventDefault();
      this.dispatchEvent( new CustomEvent( 'cancel' ) ); 
    } );    
    this.$delete = this.shadowRoot.querySelector( 'adc-button:nth-of-type( 2 )' );        
    this.$delete.addEventListener( this._touch, ( evt ) => { 
      evt.preventDefault();
      this.dispatchEvent( new CustomEvent( 'delete' ) ); 
    } );    
    this.$edit = this.shadowRoot.querySelector( 'adc-button:nth-of-type( 5 )' );    
    this.$edit.addEventListener( this._touch, (evt ) => { 
      evt.preventDefault();
      this.dispatchEvent( new CustomEvent( 'edit' ) ); 
    } );    
    this.$save = this.shadowRoot.querySelector( 'adc-button:nth-of-type( 4 )' );        
    this.$save.addEventListener( this._touch, ( evt ) => { 
      evt.preventDefault();
      this.dispatchEvent( new CustomEvent( 'save' ) );
    } );        
  }

  // When attributes change
  _render() {
    const mode = this.mode === null ? 0 : this.mode;

    switch( mode ) {
      case AvocadoControls.ADD_ONLY:
        this.$add.hidden = false;
        this.$cancel.hidden = true;
        this.$delete.hidden = true;
        this.$edit.hidden = true;
        this.$save.hidden = true;
        break;

      case AvocadoControls.CANCEL_SAVE: 
        this.$add.hidden = true;
        this.$cancel.hidden = false;
        this.$delete.hidden = true;
        this.$edit.hidden = true;
        this.$save.hidden = false;      
        break;

      case AvocadoControls.ADD_EDIT: 
        this.$add.hidden = false;
        this.$cancel.hidden = true;
        this.$delete.hidden = true;
        this.$edit.hidden = false;
        this.$save.hidden = true;      
        break;
        
      case AvocadoControls.DELETE_CANCEL_SAVE: 
        this.$add.hidden = true;
        this.$cancel.hidden = false;
        this.$delete.hidden = false;
        this.$edit.hidden = true;
        this.$save.hidden = false;      
        break;        

      case AvocadoControls.NONE: 
        this.$add.hidden = true;
        this.$cancel.hidden = true;
        this.$delete.hidden = true;
        this.$edit.hidden = true;
        this.$save.hidden = true;      
        break;                
    }    
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
    this._upgrade( 'mode' );        
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'hidden',
      'mode'
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

  get mode() {
    if( this.hasAttribute( 'mode' ) ) {
      return parseInt( this.getAttribute( 'mode' ) );
    }

    return null;
  }

  set mode( value ) {
    if( value !== null ) {
      this.setAttribute( 'mode', value );
    } else {
      this.removeAttribute( 'mode' );
    }
  }    
}

AvocadoControls.ADD_ONLY = 0;
AvocadoControls.CANCEL_SAVE = 1;
AvocadoControls.ADD_EDIT = 2;
AvocadoControls.DELETE_CANCEL_SAVE = 3;
AvocadoControls.NONE = 4;

window.customElements.define( 'adc-controls', AvocadoControls );
