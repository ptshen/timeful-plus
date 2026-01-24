# Feature Plan: Time Interval Default & Capacity     
  Limit                                                
                                                       
  ## Overview                                          
                                                       
  Two new features for Timeful:                        
  1. **Change default time interval** from 15          
  minutes to 1 hour (keep all options)                 
  2. **Add configurable capacity limit** per time      
  slot (default: 4 people, first come first            
  served)                                              
                                                       
  ---                                                  
                                                       
  ## Feature 1: Default Time Interval to 1 Hour        
                                                       
  ### Changes Required                                 
                                                       
  **Frontend only** - Single file change:              
                                                       
  | File | Change |                                    
  |------|--------|                                    
  | `frontend/src/components/NewEvent.vue` |           
  Change `timeIncrement` default from `15` to `60`     
  |                                                    
                                                       
  ### Implementation                                   
                                                       
  In `frontend/src/components/NewEvent.vue` (line      
  583):                                                
  ```javascript                                        
  // Change from:                                      
  timeIncrement: 15,                                   
  // To:                                               
  timeIncrement: 60,                                   
  ```                                                  
                                                       
  The dropdown options (15 min, 30 min, 60 min)        
  remain unchanged.                                    
                                                       
  ---                                                  
                                                       
  ## Feature 2: Configurable Capacity Limit Per        
  Time Slot                                            
                                                       
  ### Data Model Changes                               
                                                       
  **Backend: `server/models/event.go`**                
  - Add new field: `MaxCapacityPerSlot *int`           
  (default: 4, nil means unlimited)                    
                                                       
  ### API Changes                                      
                                                       
  **Backend: `server/routes/events.go`**               
                                                       
  1. **Create/Update Event** (`createEvent`,           
  `updateEvent`):                                      
  - Accept `maxCapacityPerSlot` in payload             
  - Store in Event document                            
                                                       
  2. **Submit Availability**                           
  (`updateEventResponse`):                             
  - Before saving, check each timestamp in             
  submitted availability                               
  - Count existing responses for that timestamp        
  - Reject timestamps that would exceed                
  capacity                                             
  - Return 400 with list of blocked timestamps         
                                                       
  3. **Get Event/Responses**:                          
  - Include `maxCapacityPerSlot` in event              
  response                                             
  - Include current counts per timeslot (for           
  frontend to display)                                 
                                                       
  ### Frontend Changes                                 
                                                       
  | File | Change |                                    
  |------|--------|                                    
  | `frontend/src/components/NewEvent.vue` | Add       
  capacity limit input field in Options section |      
  | `frontend/src/components/schedule_overlap/Sche     
  duleOverlap.vue` | Disable slots at capacity,        
  show visual indicator |                              
  | `frontend/src/components/schedule_overlap/Resp     
  ondentsList.vue` | Show capacity (e.g., "3/4"        
  instead of "3/5") |                                  
                                                       
  ### Frontend Logic                                   
                                                       
  1. **ScheduleOverlap.vue**:                          
  - Track `slotCounts` - Map of timestamp to           
  number of people                                     
  - In `startDrag()`/`continueDrag()`: Skip            
  slots where count >= maxCapacity                     
  - Add CSS class for "full" slots (grayed out         
  or different color)                                  
  - Show tooltip "This time slot is full" on           
  hover                                                
                                                       
  2. **NewEvent.vue**:                                 
  - Add number input for "Max people per time          
  slot" (min: 1, default: 4)                           
  - Include in event creation payload                  
                                                       
  ### Validation Flow                                  
                                                       
  ```                                                  
  User tries to select slot at 2pm                     
  → Frontend checks:                                   
  responsesFormatted.get(2pm).size >= maxCapacity?     
  → If yes: Prevent selection, show "Slot full"        
  indicator                                            
  → If no: Allow selection                             
                                                       
  User submits availability                            
  → Backend validates each timestamp                   
  → For each timestamp: count existing responses       
  → If any would exceed capacity: Return 400           
  with blocked timestamps                              
  → Frontend shows error: "Some time slots are         
  now full"                                            
  ```                                                  
                                                       
  ---                                                  
                                                       
  ## Files to Modify                                   
                                                       
  | File | Changes |                                   
  |------|---------|                                   
  | `server/models/event.go` | Add                     
  `MaxCapacityPerSlot` field |                         
  | `server/routes/events.go` | Validate capacity      
  on response submission |                             
  | `frontend/src/components/NewEvent.vue` |           
  Default interval to 60, add capacity input |         
  | `frontend/src/components/schedule_overlap/Sche     
  duleOverlap.vue` | Block full slots, visual          
  indicator |                                          
  | `frontend/src/components/schedule_overlap/Resp     
  ondentsList.vue` | Update count display |            
                                                       
  ---                                                  
                                                       
  ## Documentation Update                              
                                                       
  Add to `CLAUDE.md` under a new "Features"            
  section:                                             
                                                       
  ```markdown                                          
  ## Features                                          
                                                       
  ### Time Slot Configuration                          
  - Event creators can set time increment (15 min,     
  30 min, 1 hour) - default: 1 hour                    
  - Event creators can set max capacity per time       
  slot (default: 4 people)                             
                                                       
  ### Capacity Limits                                  
  - When a time slot reaches max capacity, it          
  becomes unavailable for new selections               
  - First come, first served: existing selections      
  are preserved                                        
  - Visual indicator shows full slots (grayed out)     
  - Display shows "X/Y" where Y is the capacity        
  limit                                                
  ```                                                  
                                                       
  ---                                                  
                                                       
  ## Verification                                      
                                                       
  1. **Time interval default**:                        
  - Create new event → Verify dropdown defaults        
  to "60 min"                                          
  - Existing events unchanged                          
                                                       
  2. **Capacity limit**:                               
  - Create event with max capacity = 2                 
  - Have 2 users mark same time slot available         
  - 3rd user should see slot grayed out, cannot        
  select                                               
  - Verify backend rejects if somehow submitted        
                                                       
  3. **Edge cases**:                                   
  - Event with no capacity limit (unlimited)           
  - User editing their own availability (should        
  work even if slot is "full" with their existing      
  selection)                    