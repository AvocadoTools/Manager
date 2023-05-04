export default class RemotePersonItemRenderer extends HTMLElement {
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
          gap: 3px;
          height: 56px;
          justify-content: center;
          min-height: 56px;
          padding: 0 16px 0 16px;
          position: relative;
        }

        p {
          box-sizing: border-box;
          color: #161616;
          cursor: pointer;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          margin: 0;
          padding: 0;
          text-rendering: optimizeLegibility;
          width: 100%;
        }

        p:last-of-type {
          color: #6f6f6f;
          display: none;
          font-size: 12px;
          margin: 0;
        }        
      </style>
      <p></p>
      <p></p>
    `;

    // Properties
    this._data = null;
    this._label = null;

    // Root
    const shadowRoot = this.attachShadow( {mode: 'open'} );
    shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$name = shadowRoot.querySelector( 'p:nth-of-type( 1 )' );
    this.$title = shadowRoot.querySelector( 'p:nth-of-type( 2 )' );    
  }

  // When things change
  _render() {
    if( this._data !== null ) {
      this.$name.innerText = this._data.fullName;
      this.$title.style.display = this._data.jobTitle === null ? 'none' : 'block';
      this.$title.innerText = this._data.jobTitle;
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

window.customElements.define( 'arm-person-item-renderer', RemotePersonItemRenderer );
