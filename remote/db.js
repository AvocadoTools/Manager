export const db = new Dexie( 'RemoteManager' );
db.version( 520 ).stores( {
  Action: 'id, description, dueAt',
  Conversation: 'id, startAt',
  Document: 'id, updatedAt, name',
  Link: 'id, name',  
  Meeting: 'id, startAt',  
  Milestone: 'id, name',
  Person: 'id, fullName',
  Priority: 'id, name',   
  Project: 'id, name',
  Room: 'id, name',
  Situation: 'id, startAt',  
  Status: 'id, name',
  Tag: 'id, name',
  Type: 'id, name'
} );
