export default class AvocadoToggle extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        :host( [concealed] ) {
          visibility: hidden;
        }

        :host( [hidden] ) {
          display: none;
        }

        div[part=dial] {
          background-color: #ffffff;
          border-radius: 18px;
          box-sizing: border-box;
          height: 18px;
          transform: translate( 0 );
          transition: transform 150ms ease-in-out;
          width: 18px;
        }

        div[part=toggle] {
          align-items: center;
          background-color: var( --toggle-background-color, #8d8d8d );
          box-sizing: border-box;
          border-radius: 24px;
          display: flex;
          flex-direction: row;
          height: 24px;
          padding: 0 4px 0 4px;
          transition: background-color 150ms ease-in-out;
          width: 48px;
        }

        label {
          align-items: center;
          cursor: pointer;
          display: flex;
          flex-direction: row;
          gap: 8px;
        }

        p {
          color: #525252; 
          cursor: default;
          display: none;
          font-family: 'IBM Plex Sans', sans-serif;
          font-weight: 400;
          margin: 0;
          padding: 0;
          text-rendering: optimizeLegibility;
        }

        p[part=unchecked-text],
        p[part=checked-text] {
          cursor: pointer;          
          font-size: 14px;
        }

        p[part=label] {
          font-size: 12px;
          margin: 0 0 4px 0;
        }

        :host( [unchecked-text]:not( [checked] ) ) p[part=unchecked-text] {
          display: block;
        }        

        :host( [checked] ) div[part=toggle] {
          background-color: var( --toggle-checked-background-color, #198038 );
        }

        :host( [checked] ) div[part=dial] {
          transform: translateX( 22px );
        }        

        :host( [checked][checked-text] ) p[part=checked-text] {
          display: block;
        }

        :host( [label] ) p[part=label] {
          display: block;
        }        

        :host( [size=sm] ) div[part=dial] {
          height: 12px;
          width: 12px;
        }

        :host( [size=sm] ) div[part=toggle] {
          height: 16px;
          padding: 0 2px 0 2px;
          width: 32px;
        }

        :host( [checked][size=sm] ) div[part=dial] {
          transform: translate( 16px );
        }
      </style>
      <p part="label"></p>
      <label part="field">
        <div part="toggle">
          <div part="dial"></div>
        </div>
        <p part="checked-text"></p>
        <p part="unchecked-text"></p>            
      </label>
    `;

    // Private
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$checkedText = this.shadowRoot.querySelector( 'p[part=checked-text]' );
    this.$field = this.shadowRoot.querySelector( 'label' );
    this.$label = this.shadowRoot.querySelector( 'p[part=label]' );
    this.$uncheckedText = this.shadowRoot.querySelector( 'p[part=unchecked-text]' );   
    
    // Elements
    this.$field.addEventListener( 'click', () => {
      this.checked = !this.checked;
      this.dispatchEvent( new CustomEvent( 'change', {
        detail: this.checked
      } ) );
    } );
  }

   // When attributes change
  _render() {
    this.$checkedText.innerText = this.checkedText === null ? '' : this.checkedText;
    this.$label.innerText = this.label === null ? '' : this.label;    
    this.$uncheckedText.innerText = this.uncheckedText === null ? '' : this.uncheckedText;
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
    this._upgrade( 'checked' );             
    this._upgrade( 'checkedText' );         
    this._upgrade( 'concealed' );        
    this._upgrade( 'data' );           
    this._upgrade( 'disabled' );     
    this._upgrade( 'hidden' );    
    this._upgrade( 'label' );  
    this._upgrade( 'size' );      
    this._upgrade( 'uncheckedText' );              
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'checked',
      'checked-text',
      'concealed',
      'disabled',
      'hidden',
      'label',
      'size',
      'unchecked-text'
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
  get checked() {
    return this.hasAttribute( 'checked' );
  }

  set checked( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'checked' );
      } else {
        this.setAttribute( 'checked', '' );
      }
    } else {
      this.removeAttribute( 'checked' );
    }
  }

  get checkedText() {
    if( this.hasAttribute( 'checked-text' ) ) {
      return this.getAttribute( 'checked-text' );
    }

    return null;
  }

  set checkedText( value ) {
    if( value !== null ) {
      this.setAttribute( 'checked-text', value );
    } else {
      this.removeAttribute( 'checked-text' );
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

  get size() {
    if( this.hasAttribute( 'size' ) ) {
      return this.getAttribute( 'size' );
    }

    return null;
  }

  set size( value ) {
    if( value !== null ) {
      this.setAttribute( 'size', value );
    } else {
      this.removeAttribute( 'size' );
    }
  }        

  get uncheckedText() {
    if( this.hasAttribute( 'unchecked-text' ) ) {
      return this.getAttribute( 'unchecked-text' );
    }

    return null;
  }

  set uncheckedText( value ) {
    if( value !== null ) {
      this.setAttribute( 'unchecked-text', value );
    } else {
      this.removeAttribute( 'unchecked-text' );
    }
  }          
}

window.customElements.define( 'adc-toggle', AvocadoToggle );
