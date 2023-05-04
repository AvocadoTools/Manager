import AvocadoHBox from "../../../containers/hbox.js";

export default class RemoteDocumentItemRenderer extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' )
    template.innerHTML = /* template */ `
      <style>
        :host {
          box-sizing: border-box;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: 56px;
          justify-content: center;
          padding: 0 16px 0 16px;
          position: relative;
        }

        p {
          color: #161616;
          cursor: pointer;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          margin: 0;
          padding: 0;
          text-rendering: optimizeLegibility;
        }

        p[part=date] {        
          flex-basis: 0;
          flex-grow: 1;
        }

        adc-hbox {
          margin: 0 0 3px 0;
          width: 100%;
        }

        adc-hbox p {
          color: #6f6f6f;
          font-size: 12px;
        } 
      </style>
      <adc-hbox>
        <p part="date"></p>
        <p part="time"></p>        
      </adc-hbox>
      <p part="subject"></p>
    `;

    // Properties
    this._data = null;
    this._label = null;

    // Root
    const shadowRoot = this.attachShadow( {mode: 'open'} );
    shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$date = shadowRoot.querySelector( 'p[part=date]' );
    this.$time = shadowRoot.querySelector( 'p[part=time]' );    
    this.$subject = shadowRoot.querySelector( 'p[part=subject]' );        
  }

  // When things change
  _render() {
    if( this._data !== null ) {
      const date = new Intl.DateTimeFormat( navigator.language, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      } ).format( this._data.startAt );    
      this.$date.innerText = date;

      const time = new Intl.DateTimeFormat( navigator.language, {
        hour: 'numeric',
        minute: '2-digit'
      } ).format( this._data.startAt );          
      this.$time.innerText = time;

      this.$subject.innerText = this._data.name;
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
    this._upgrade( 'data' );                  
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [];
  }

  // Observed tag attribute has changed
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
    this._render();
  }
}

window.customElements.define( 'arm-document-item-renderer', RemoteDocumentItemRenderer );
