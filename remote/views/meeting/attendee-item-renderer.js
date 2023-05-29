import AvocadoHBox from "../../../containers/hbox.js";

import { db } from "../../db.js";

export default class RemoteAttendeeItemRenderer extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' )
    template.innerHTML = /* template */ `
      <style>
        :host {
          align-items: center;
          box-sizing: border-box;
          cursor: pointer;
          display: flex;
          flex-direction: row;
          height: 56px;
          justify-content: center;
          padding: 0 16px 0 16px;
          position: relative;
        }

        img {
          border-radius: 40px;
          height: 40px;
          margin: 0;
          padding: 0;
          width: 40px;          
        }

        p {
          color: #161616;
          cursor: pointer;
          flex-basis: 0;
          flex-grow: 1;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          margin: 0;
          padding: 0 0 0 16px;
          text-rendering: optimizeLegibility;
        } 
      </style>
      <img part="image" />
      <p part="name"></p>
    `;

    // Properties
    this._data = null;

    // Root
    const shadowRoot = this.attachShadow( {mode: 'open'} );
    shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$image = shadowRoot.querySelector( 'img' );
    this.$name = shadowRoot.querySelector( 'p' );        
  }

  // When things change
  _render() {
    if( this._data !== null ) {
      if( this._data.avatar === null ) {
        this.$image.src = '';
        this.$image.style.visibility = 'hidden';
      } else {
        this.$image.src = this._data.avatar.data;
        this.$image.style.visibility = 'visible';        
      }

      this.$name.innerText = this._data.fullName;
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
    db.Person.where( {id: value.id} ).first()
    .then( ( item ) => {
      this._data = item;
      this._render();      
    } );
  }
}

window.customElements.define( 'arm-attendee-item-renderer', RemoteAttendeeItemRenderer );
