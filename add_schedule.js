// ボタンクリックで始動
function onClickAdd() {
    const ui=SpreadsheetApp.getUi();
    const can_add=ui.alert("確認", "本当にカレンダーに追加してもよろしいですか",ui.ButtonSet.YES_NO);
    if (can_add == ui.Button.YES){
      const num_events=generateEventTitles();
      if (num_events>=1){
        addCalendar(num_events);
      }else{
        spreadsheet.toast('追加できるイベントが見つかりません．','Warning', 5);
      }
    }
  }
  
  
  function onClickDelete() {
    const ui=SpreadsheetApp.getUi();
    const can_add=ui.alert("確認", "本当に入力内容を破棄しますか",ui.ButtonSet.YES_NO);
    if (can_add == ui.Button.YES){
      deleteInputs();
    }
  }
  
  // 各種関数
  function generateEventTitles(){
    const spreadsheet=SpreadsheetApp.getActiveSpreadsheet();
    const sheet_execute=spreadsheet.getSheetByName('execute');
    const num_events=sheet_execute.getLastRow()-2;
    if (num_events<1){
      return 0;
    }
    const event_info=sheet_execute.getRange(3,3,num_events,4).getValues();
    const event_titles=event_info.map(info=>{
      if(info[0]!=''){
        if(info[1]!=''){
          if (info[3]!=''){
            return [`${info[0]}時限目-${info[1]}時間目: ${info[2]}【${info[3]}】`];
          }else{
            return [`${info[0]}時限目-${info[1]}時間目: ${info[2]}`];
          }
        }else{
          if (info[3]!=''){
            return [`${info[0]}時限目: ${info[2]}【${info[3]}】`];
          }else{
            return [`${info[0]}時限目: ${info[2]}`];
          }
        }
      }else{
        if (info[3]!=''){
          return [`${info[2]}【${info[3]}】`];
        }else{
          return [`${info[2]}`];
        }
      }
      })
    sheet_execute.getRange(3,7,num_events,1).setValues(event_titles);
    return num_events;
  }
  function addCalendar(num_events){
    console.log('追加開始')
    const cal_id=PropertiesService.getScriptProperties().getProperty('GOOGLE_ACCOUNT');
    var calendar = CalendarApp.getCalendarById(cal_id);
    const spreadsheet=SpreadsheetApp.getActiveSpreadsheet();
    const sheet_execute=spreadsheet.getSheetByName('execute');
    for (let i=0; i<num_events; i++){
      sheet_execute.getRange(3+i,1).setValue('waiting');
    }
    SpreadsheetApp.flush();
    const dates=sheet_execute.getRange(3,2,num_events,1).getValues().map(_=>_[0]);
    const start_period=sheet_execute.getRange(3,3,num_events,1).getValues().map(p=>{
      return periodToTime(p.toString());
    });
    const end_period=sheet_execute.getRange(3,4,num_events,1).getValues().map(p=>{
      return periodToTime(p.toString());
    });
    const titles=sheet_execute.getRange(3,7,num_events,1).getValues().map(_=>_[0]);
    for (let i=0; i<num_events;i++){
      try{
        let event;
        let start_date=new Date(dates[i]);
        let end_date=new Date(dates[i])
        if (start_period[i].start.hour==-1){
          end_date.setDate(end_date.getDate()+1);
          event = calendar.createAllDayEvent(
              titles[i],
              start_date,
              end_date
            );
        }else{
          start_date.setHours(start_period[i].start.hour);
          start_date.setMinutes(start_period[i].start.min);
          if(end_period[i].start.hour==-1){
            end_date.setHours(start_period[i].end.hour);
            end_date.setMinutes(start_period[i].end.min);
          }else{
            end_date.setHours(end_period[i].end.hour);
            end_date.setMinutes(end_period[i].end.min);
          }
          event = calendar.createEvent(
              titles[i],
              start_date,
              end_date
            );
        }
        console.log(event.getId());
        sheet_execute.getRange(3+i,1).setValue("DONE");
      }catch(e){
        Logger.log(e);
      }
    }
  }
  
  function periodToTime(period){
    switch(period){
      case '1':
        return {'start':{'hour':8,'min':50}, 'end':{'hour':10, 'min':20}};
      case '2':
        return {'start':{'hour':10,'min':30}, 'end':{'hour':12,'min':0}};
      case '3':
        return {'start':{'hour':13,'min':0}, 'end':{'hour':14,'min':30}};
      case '4':
        return {'start':{'hour':14,'min':40}, 'end':{'hour':16,'min':10}};
      case '5':
        return {'start':{'hour':16,'min':20}, 'end':{'hour':17,'min':50}};
      case '6':
        return {'start':{'hour':18,'min':0}, 'end':{'hour':19,'min':30}};
      default:
        return {'start': {'hour':-1,'min':-1}, 'end': {'hour':-1,'min':-1}};
    }
  }
  
  function deleteInputs(){
    const spreadsheet=SpreadsheetApp.getActiveSpreadsheet();
    const sheet_execute=spreadsheet.getSheetByName('execute');
    const num_events=sheet_execute.getLastRow()-2;
    sheet_execute.getRange(3,1,num_events,7).clearContent();
    return;
  }
  