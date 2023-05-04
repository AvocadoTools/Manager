export default class AvocadoTextarea extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' )
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

        div {
          align-items: flex-end;
          display: none;
          flex-basis: 0;
          flex-direction: row;
          flex-grow: 1;
          margin: 0;
          padding: 0;
        }

        div > div {
          align-items: flex-start;
          display: flex;
          flex-direction: column;
        }

        label {
          align-items: center;
          background-color: #f4f4f4;
          border-bottom: solid 1px #8d8d8d;
          box-sizing: border-box;
          display: flex;
          flex-direction: row;
          height: 100%;
          margin: 0;
          outline: solid 2px transparent;
          outline-offset: -2px;
          padding: 0;
          position: relative;
        }

        label:focus-within {
          outline: solid 2px #0f62fe;
        }

        p.icon {
          color: #da1e28;
          cursor: default;
          direction: ltr;
          font-family: 'Material Symbols Outlined';
          font-size: 18px;
          font-style: normal;
          font-weight: normal;
          height: 20px;
          letter-spacing: normal;
          margin: 0;
          min-height: 20px;
          min-width: 0;          
          opacity: 0;
          overflow: hidden;
          padding: 0;
          position: absolute;
          right: 12px;
          text-transform: none;
          top: 12px;
          white-space: nowrap;
          width: 0;
          word-wrap: normal;
        }                

        p.text {
          cursor: default;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          margin: 0;
          padding: 0;
          text-rendering: optimizeLegibility;
        }

        p[part=error] {
          color: #6f6f6f;          
          font-size: 12px;
          padding: 4px 0 4px 0;
          visibility: hidden;
        }

        p[part=helper] {
          color: #6f6f6f;     
          display: none;
          font-size: 12px;          
          padding: 0 0 4px 0;            
        }

        p[part=label] {
          color: #525252;          
          flex-basis: 0;
          flex-grow: 1;
          font-size: 12px;
          padding: 0;
        }

        textarea {
          background: none;
          border: none;
          box-sizing: border-box;
          flex-basis: 0;
          flex-grow: 1;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          height: 100%;
          margin: 0;
          min-height: 40px;
          outline: none;
          padding: 11px 40px 11px 16px;
          resize: none;
          text-rendering: optimizeLegibility;
        }

        textarea::placeholder {
          color: #a8a8a8;
        }                

        ::slotted( adc-link ) {
          margin: 0 0 2px 0;
          --link-font-size: 12px;
        }

        :host( [error] ) p[part=error] {
          visibility: visible;
        }

        :host( [label] ) div {
          display: flex;
        }

        :host( [label]:not( [helper] ) ) p[part=label] {
          padding: 0 0 4px 0;
        }        

        :host( [helper] ) p[part=helper] {
          display: block;
        }

        :host( [invalid] ) label {
          outline: solid 2px #da1e28;
        }

        :host( [invalid] ) label:focus-within {
          outline: solid 2px #0f62fe;
        }

        :host( [invalid] ) p[part=error] {
          color: #da1e28;
        }

        :host( [invalid] ) p.icon {
          min-width: 20px;
          opacity: 1.0;
          width: 20px;
        }

        :host( [light] ) label {
          background-color: #ffffff;
        }

        :host( [read-only] ) label {
          border-bottom: solid 1px transparent;
        }        

        :host( [read-only] ) label:focus-within {        
          outline: solid 2px transparent;
        }

        :host( [read-only] ) textarea {
          cursor: default;
        }                

        :host( [disabled] ) label {
          border-bottom: solid 1px transparent;
        }

        :host( [disabled] ) p[part=error],
        :host( [disabled] ) p[part=helper],
        :host( [disabled] ) p[part=label] {
          color: #16161640;
        }

        :host( [disabled] ) textarea {
          color: #c6c6c6;
          cursor: not-allowed;
        }

        :host( [disabled][invalid] ) p[part=error] {
          color: #da1e28;
        }
      </style>
      <div>
        <div>      
          <p class="text" part="label"></p>
          <p class="text" part="helper"></p>
        </div>
        <slot></slot>        
      </div>
      <label part="field">
        <textarea part="input"></textarea>
        <p class="icon" part="invalid">error</p>        
      </label>
      <p class="text" part="error"></p>
    `;

    // Properties
    this._data = null;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$error = this.shadowRoot.querySelector( 'p[part=error]' );    
    this.$label = this.shadowRoot.querySelector( 'p[part=label]' );
    this.$helper = this.shadowRoot.querySelector( 'p[part=helper]' );
    this.$textarea = this.shadowRoot.querySelector( 'textarea' );
    this.$textarea.addEventListener( 'input', ( evt ) => {
      this.value = evt.currentTarget.value;
    } );
  }

  blur() {
    this.$textarea.blur();
  }

  clear() {
    this.$textarea.value = '';
    this.value = null;
  }

  focus() {
    this.$textarea.focus();
  }

  // When things change
  _render() {
    this.$error.innerText = this.error === null ? '&nbsp;' : this.error;
    this.$textarea.disabled = this.disabled;
    this.$textarea.inputMode = this.mode === null ? '' : this.mode;
    this.$textarea.placeholder = this.placeholder === null ? '' : this.placeholder;
    this.$textarea.readOnly = this.readOnly;
    this.$textarea.value = this.value === null ? '' : this.value;
    this.$label.innerText = this.label === null ? '' : this.label;
    this.$helper.innerText = this.helper === null ? '' : this.helper;
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
    this._upgrade( 'error' );
    this._upgrade( 'helper' );
    this._upgrade( 'hidden' );
    this._upgrade( 'invalid' );
    this._upgrade( 'label' );
    this._upgrade( 'light' );
    this._upgrade( 'mode' );
    this._upgrade( 'placeholder' );
    this._upgrade( 'readOnly' );
    this._upgrade( 'value' );
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'concealed',
      'disabled',
      'error',
      'helper',
      'hidden',
      'invalid',
      'label',
      'light',
      'mode',
      'placeholder',
      'read-only',
      'value'
    ];
  }

  // Observed tag attribute has changed
  // Update render
  attributeChangedCallback( name, old, value ) {
    this._render();
  }

  // Arbitrary storage
  // For your convenience
  // Not used in component
  get data() {
    return this._data;
  }

  set data( value ) {
    this._data = value;
  }

  // Reflect attributes
  // Return typed value (Number, Boolean, String, null)
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

  get error() {
    if( this.hasAttribute( 'error' ) ) {
      return this.getAttribute( 'error' );
    }

    return null;
  }

  set error( value ) {
    if( value !== null ) {
      this.setAttribute( 'error', value );
    } else {
      this.removeAttribute( 'error' );
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

  get invalid() {
    return this.hasAttribute( 'invalid' );
  }

  set invalid( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'invalid' );
      } else {
        this.setAttribute( 'invalid', '' );
      }
    } else {
      this.removeAttribute( 'invalid' );
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

  get light() {
    return this.hasAttribute( 'light' );
  }

  set light( value ) {
    if( value !== null ) {
      if( typeof value === 'boolean' ) {
        value = value.toString();
      }

      if( value === 'false' ) {
        this.removeAttribute( 'light' );
      } else {
        this.setAttribute( 'light', '' );
      }
    } else {
      this.removeAttribute( 'light' );
    }
  }

  get mode() {
    if( this.hasAttribute( 'mode' ) ) {
      return this.getAttribute( 'mode' );
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

  get placeholder() {
    if( this.hasAttribute( 'placeholder' ) ) {
      return this.getAttribute( 'placeholder' );
    }

    return null;
  }

  set placeholder( value ) {
    if( value !== null ) {
      this.setAttribute( 'placeholder', value );
    } else {
      this.removeAttribute( 'placeholder' );
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

  get value() {
    let result = null;

    if( this.hasAttribute( 'value' ) ) {
      if( this.getAttribute( 'value').trim().length > 0 ) {
        result = this.getAttribute( 'value' );
      }
    }

    return result;
  }

  set value( content ) {
    if( content !== null ) {
      if( content.trim().length === 0 ) {
        this.removeAttribute( 'value' );
      } else {
        this.setAttribute( 'value', content );
      }
    } else {
      this.removeAttribute( 'value' );
    }
  }
}

window.customElements.define( 'adc-textarea', AvocadoTextarea );
