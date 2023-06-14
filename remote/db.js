export const db = new Dexie( 'RemoteManager' );
db.version( 580 ).stores( {
  Action: 'id',
  Attachment: 'id, name',
  Conversation: 'id, startAt',
  Document: 'id, updatedAt, name',
  Growth: 'id, updatedAt',
  Link: 'id, name',  
  Meeting: 'id, startAt',  
  Milestone: 'id, name',
  Person: 'id, fullName',
  Priority: 'id, name',   
  Project: 'id, name',
  Room: 'id, name',
  Situation: 'id, startAt',  
  Skills: 'id, name',
  Status: 'id, name',
  Tag: 'id, name',
  Type: 'id, name'
} );
