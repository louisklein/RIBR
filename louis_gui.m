%% Louis' GUI to run his first experiment
%
% date: 07-June-2017
%
% authors:
% - Louis Klein
% - Nic Badcock
%
% Aims:
% - create figure window for experimental presentation
% - give it 'hot key' functions
% - make it save stuff
% - demonstrate:
%   * presenting text
%   * deleting/removing text
%   * edit box
%   * button
%   * read in data/csv stimulus file to display

%% setup as a function
function  louis_gui
% clears the command window
clc;
close all

% making a figure
fig.set.position = [.0 .0 1.0 1.0];
fig.set.run_n = []; % add number here to test the phases with X number of trials - leave empty for real experiment (ie full lists)
fig.col = myColours;
fig.set.background_colour = fig.col.grey;
fig.set.letter_pause_sec = 12;
fig.set.item_duration_sec = 12;
fig.set.item_inter_stimulus_interval_sec = 3;
fig.set.inter_phase_interval = 10;
fig.set.fr_timeout = 60;
fig.set.item_xy = [.5 .7];
fig.set.quit_key = '9';

% toggle test mode
fig.set.test_time = 1;
fig.set.get_inputs = 1;
if fig.set.test_time
    fig.set.fr_timeout = 18;
    fig.set.run_n = 2;
    fig.set.letter_pause_sec = .5;
    fig.set.item_duration_sec = 2;
    fig.set.item_inter_stimulus_interval_sec = 1;
    fig.set.inter_phase_interval = 1;
end
%% read in stim file

fig.stim.rp.translation = 'retrieval phase';
fig.stim.rp.file = 'Retrieval_Practise.csv';
fig.stim.dir = fullfile(fileparts(which(mfilename)),'Stimulus Lists');
fig.stim.rp.fullfile = fullfile(fig.stim.dir,fig.stim.rp.file);
fig = readStimFile(fig,'rp');

fig.stim.lp.translation = 'learning phase';
fig.stim.lp.file = 'Learning_Phase.csv';
fig.stim.lp.fullfile = fullfile(fig.stim.dir,fig.stim.lp.file);
fig = readStimFile(fig,'lp');

fig.stim.fr.translation = 'final recall phase';
fig.stim.fr.file = 'Final_Recall.csv';
fig.stim.fr.fullfile = fullfile(fig.stim.dir,fig.stim.fr.file);
fig = readStimFile(fig,'fr');

%% save settings

fig = saveSetup(fig);

% choose the list based on the participant id
fig.stim.rp.fields = fields(fig.stim.rp.list);
fig.stim.rp.n_list = mod(str2double(fig.save.code),numel(fig.stim.rp.fields))+1;
fig.stim.rp.list.use = fig.stim.rp.list.(fig.stim.rp.fields{fig.stim.rp.n_list});

fig.stim.lp.fields = fields(fig.stim.lp.list);
fig.stim.lp.n_list = ceil(fig.stim.rp.n_list/4);
fig.stim.lp.list.use = fig.stim.lp.list.(fig.stim.lp.fields{fig.stim.lp.n_list});

fig.stim.fr.fields = fields(fig.stim.fr.list);
fig.stim.fr.n_list = ceil((mod(numel(fig.stim.fr.fields),4)+1)/2);
fig.stim.fr.list.use = fig.stim.fr.list.(fig.stim.fr.fields{fig.stim.fr.n_list});

fig.h = figure(...
    'Units','Normalized',...
    'Position',fig.set.position,...
    'KeyPressFcn',@getKeyPress,...
    'DeleteFcn',@closeGui,...
    'MenuBar','none',...
    'ToolBar','none',...
    'Color',fig.set.background_colour ... % no comma after this
    );

fig.tmp.edit_box = uicontrol('Parent',fig.h,'Style','Edit',...
    'units','normalized',...
    'FontName', 'Calibri',...
    'FontSize', 16,...
    'Position',[.4 .45 .2 .05],... % sets the position as a division of the figure size
    'CallBack',@getResponse,...
    'Tag','box',....
    'UserData',1,'Visible','off');

set(fig.h, 'Pointer', 'custom', 'PointerShapeCData', NaN(16,16))
set(fig.h,'UserData',fig);

% runs initial instructions
fig = runInstructions(fig);
% runs first phase stimulus list
fig.stim.list.use = fig.stim.lp.list.use;
fig = runStimList(fig);
pause(fig.set.inter_phase_interval)

% runs second phase instructions
runInstructions(fig,'phase_two');
% runs second phase stimulus list
fig.stim.list.use = fig.stim.rp.list.use;
fig = runPhase2(fig,'phase_two');

% runs final phase instructions
runInstructions(fig,'phase_three');
% runs final phase stimulus list
fig.stim.list.use = fig.stim.fr.list.use;
fig = runPhase3(fig,'phase_three');

% thanks participants and close program
runInstructions(fig,'finish');
delete(fig.h);

end


%% myColours
% - list of colours I might want to use
function col = myColours
col.black = [.1 .1 .1];
col.blue = [.3 .3 .8];
col.grey = [.99 .99 .99];
col.greytext = [.95 .95 .95];
end

%% getKeyPress
function getKeyPress(h,event_data)
fig = get(h,'UserData');
% fig.data.keypress = toc;

switch event_data.Key
    case []
    case fig.set.quit_key
        delete(fig.h);
    otherwise
        fprintf('''%s'' key pressed\n', event_data.Key)
end
set(h,'UserData',fig);
end

%%  runInstructions
function  fig = runInstructions(fig,in_phase)
fig.tmp.stack = dbstack;
fig.phase.current = fig.tmp.stack(1).name;

fig.instruct.continue = 'Press ''Space Bar'' to continue.';
fig.instruct.continue_format = '\n%s';
fig.instruct.texts = {...
    {'In the first phase of the experiment you will be presented with a series of statements on the screen.',... % instruction 1: line 1
    'Each statement will appear for several seconds before disappearing, so it is important that you pay close attention.',... % instruction 1: line 2
    'You need to read each statement carefully while it is on the screen.'},... % instruction 1: line 3
    
    {'We are subtly manipulating the brightness of each statement.'... % instruction 2: line 1
    'These changes, however, should be very difficult for you to detect.'}...
    
    {'You are now ready to start the experiment'} ...
    };

if exist('in_phase','var') && ~isempty(in_phase)
    switch in_phase
        case 'phase_two'
            fig.instruct.texts = {...
                {'Here comes the next phase'},...
                {'Remember to type the full sentence when you recall the blanked-out word'},...
                };
            
        case 'phase_three'
            fig.instruct.texts = {...
                {'Here comes the final phase'},... % instruction 1: line 1
                };

        case 'finish'
            fig.instruct.texts = {...
                {'You''re all finished!','Thank you for participating!'},... % instruction 1: line 1
                };
            
    end
end
fig.instruct.text = [];
fig.phase.running = 0;
for i = 1 : numel(fig.instruct.texts)
    
    if i == numel(fig.instruct.texts)
        fig.instruct.continue = '';
    end
    fig.instruct.text{i} =  sprintf(...
        [repmat('%s\n\n',1,numel(fig.instruct.texts{1})),fig.instruct.continue_format],... % create formatting string
        fig.instruct.texts{i}{:},fig.instruct.continue);
end

set(fig.h,'UserData',fig);
figure(gcf);
for i = 1 : numel(fig.instruct.text)
    
    fig.tmp.text_handle = text(...
        .5,.5,fig.instruct.text{i},...
        'HorizontalAlignment','center',...
        'Color',fig.col.black,...
        'FontSize',25,...
        'FontName','Calibri');
    
    set(gca,'Visible','off');
    
    waitforbuttonpress;
    delete(fig.tmp.text_handle);
    
end
fig.phase.current = '';
set(fig.h,'UserData',fig);
end

%% runStimList
function fig = runStimList(fig)
fig.tmp.stack = dbstack;
fig.phase.current = fig.tmp.stack(1).name;
set(fig.h,'UserData',fig);

fprintf('Attempting to run list:\n');

makeaxes = gca(fig.h);
set(makeaxes,'Parent', fig.h,...
    'Position',[.1 .1 .8 .8],...
    'Visible','off');

% checks that the correct directory is being read
if isfield(fig,'stim') && isfield(fig.stim,'list') && isfield(fig.stim.list,'use')
    fig.tmp.n = numel(fig.stim.list.use);
    if ~isempty(fig.set.run_n)
        fig.tmp.n = fig.set.run_n;
    end
    for i = 1 : fig.tmp.n
        fprintf('\t%i: %s\n',i,fig.stim.list.use{i});
        try
            text_handle = text(fig.set.item_xy(1),fig.set.item_xy(2),...
                strrep(fig.stim.list.use{i},'_','\_'),...
                'Parent',makeaxes,'Units','Normalized',...
                'HorizontalAlignment','center',...
                'BackgroundColor',fig.set.background_colour,...
                'Color',fig.col.black,...
                'Visible','on',...
                'FontSize',50,...
                'FontName','Calibri');
        catch err
            delete(fig.h);
            error('Axes gone!!');
            
        end
        pause(fig.set.item_duration_sec);
        delete(text_handle);
        pause(fig.set.item_inter_stimulus_interval_sec)
    end
else
    warndlg('Can''t find stimulus list!!');
end
fprintf('Finished\n');
fig.phase.current = '';
set(fig.h,'UserData',fig); % update user data
end

%% runPhase2
function fig = runPhase2(fig,phase_name)
fig.tmp.stack = dbstack;
fig.phase.current = fig.tmp.stack(1).name;
set(fig.h,'UserData',fig);

set(fig.tmp.edit_box,'Visible','on');
fig.data.code = fig.save.code;
fig.data.phase = phase_name;
fig.data.phase_two_responses = [];

fig.tmp.n = numel(fig.stim.list.use);
if ~isempty(fig.set.run_n)
    fig.tmp.n = fig.set.run_n;
end
for i = 1 : fig.tmp.n
    fprintf('\t (%s) %i: %s\n',phase_name,i,fig.stim.list.use{i});
    
    fig.data.trial = i;
    phase_name = 'phase_two';
    fig.data.stimulus = fig.stim.list.use{i};
    
    fig.data.reactiontime = -9999;
    fig.data.response = 'empty';
    fig.data.correct = 0;
    set(fig.h,'UserData',fig);
    try
        tic;
        text_handle = text(fig.set.item_xy(1),fig.set.item_xy(2),...
            strrep(fig.data.stimulus,'_','\_'),...
            'Parent',gca,'Units','Normalized',...
            'HorizontalAlignment','center',...
            'BackgroundColor',fig.set.background_colour,...
            'Color',fig.col.black,...
            'FontSize',25,'FontName','Calibri');
    catch err
        delete(fig.h);
        error('Axes gone!!');
        
    end
    
    set(fig.tmp.edit_box,'Visible','On','Enable','on');
    uicontrol(fig.tmp.edit_box);
    while 1
        fig = get(fig.h,'UserData');
        if isfield(fig,'data')
            switch fig.data.response
                case 'empty'
                    % keep waiting for a response
                case 'quit'
                    delete(fig.h);
                otherwise
                    if strcmpi(fig.data.response,fig.data.stimulus)
                        fig.data.correct = 1;
                    end
                    break
            end
        end
        pause(.001);
    end
    fig.data.reactiontime = toc;
    tic;
    % stop focusing on text box
    set(fig.tmp.edit_box,'Enable','off');
    set(fig.tmp.edit_box,'Visible','Off');
    delete(text_handle);
    set(fig.tmp.edit_box,'String','');
    
    % save the data
    fig = saveData(fig);
    
    
    switch phase_name
        case 'phase_two'
            fig.data.phase_two_responses{end+1} = fig.data.response;
        case 'phase_three'
            fig.data.phase_three_responses{end+1} = fig.data.response;
    end
    while toc < fig.set.item_inter_stimulus_interval_sec
        
        pause(.001);
    end
end

fig.phase.current = '';
end

%% runPhase3

function fig = runPhase3(fig,phase_name)
fig.tmp.stack = dbstack;
fig.phase.current = fig.tmp.stack(1).name;
set(fig.h,'UserData',fig);

set(fig.tmp.edit_box,'Visible','on');
fig.data.code = fig.save.code;
fig.data.phase = phase_name;
fig.data.phase_three_responses = [];

fig.tmp.n = numel(fig.stim.list.use);
if ~isempty(fig.set.run_n)
    fig.tmp.n = fig.set.run_n;
end
for i = 1 : fig.tmp.n
    fprintf('\t (%s) %i: %s\n',phase_name,i,fig.stim.list.use{i});
    
    fig.data.trial = i;
    phase_name = 'phase_three';
    fig.data.stimulus = fig.stim.list.use{i};
    fig.data.reactiontime = -9999;
    fig.data.response = 'empty';
    fig.data.correct = 0;
    set(fig.h,'UserData',fig);
    try
        tic;
        text_handle = text(fig.set.item_xy(1),fig.set.item_xy(2),...
            strrep(fig.data.stimulus,'_','\_'),...
            'Parent',gca,'Units','Normalized',...
            'HorizontalAlignment','center',...
            'BackgroundColor',fig.set.background_colour,...
            'Color',fig.col.black,...
            'FontSize',25,'FontName','Calibri');
    catch err
        delete(fig.h);
        error('Axes gone!!');
    end
    
    set(fig.tmp.edit_box,'Visible','On','Enable','on');
    uicontrol(fig.tmp.edit_box);
    if isfield(fig.data,'responses')
        fig.data = rmfield(fig.data,'responses');
    end
    set(fig.h,'UserData',fig);
    while toc < fig.set.fr_timeout
        pause(.001);
    end
    fig = get(fig.h,'UserData');
    if isfield(fig.data,'text_handle')
        for j = 1 : numel(fig.data.text_handle)
            delete(fig.data.text_handle(j));
        end
    end
    fig.data.reactiontime = toc;
    tic;
    
    set(fig.tmp.edit_box,'Enable','off','Visible','Off');
    delete(text_handle);
    
    % save the data
    fig = saveData(fig);
    
    
    switch phase_name
        case 'phase_three'
            fig.data.phase_three_responses{end+1} = fig.data.response;
    end
    while toc < fig.set.item_inter_stimulus_interval_sec
        
        pause(.001);
    end
end

fig.phase.current = '';
end


%% readStimFile
function fig = readStimFile(fig,phase)

fprintf('Running ''readStimFile'' on (%s): %s (%s)\n',phase,fig.stim.(phase).file,fig.stim.dir);

fig.stim.(phase).data = importdata(fig.stim.(phase).fullfile,',');
fig.stim.(phase).headers = [];

remaining_text = fig.stim.(phase).data{1};
while ~isempty(remaining_text)
    [fig.stim.(phase).headers{end+1},remaining_text] = strtok(remaining_text,',');
end

% strips miscellaneous characters from strings
switch phase
    case 'rp'
        while ~strcmpi(fig.stim.(phase).headers{1}(1),'F')
            fig.stim.(phase).headers{1}(1) = [];
        end
    case 'lp'
        while ~strcmpi(fig.stim.(phase).headers{1}(1),'F')
            fig.stim.(phase).headers{1}(1) = [];
        end
    case 'fr'
        while ~strcmpi(fig.stim.(phase).headers{1}(1),'F')
            fig.stim.(phase).headers{1}(1) = [];
        end
end

for i = 1 : numel(fig.stim.(phase).headers)
    fig.stim.(phase).list.(fig.stim.(phase).headers{i}) = [];
end

for i = 2 : size(fig.stim.(phase).data,1)
    rem = fig.stim.(phase).data{i};
    for j = 1 : numel(fig.stim.(phase).headers)
        [fig.stim.(phase).list.(fig.stim.(phase).headers{j}){end+1},rem] = strtok(rem,',');
    end
end

fprintf('\tdone.\n');
end

%% getResponse
function getResponse(h,~)

fig = get(gcf,'UserData');

switch fig.phase.current
    
    case 'runPhase2'
        
        fprintf('Response:');
        response = get(h,'String');
        response_text = sprintf('''%s'' typed into box %i',response);
        fprintf('\t%s\n',response_text);
        fig.data.response = response;
        set(gcf,'UserData',fig);
        
    case 'runPhase3'
        
        fprintf('Response:');
        response = get(h,'String');
        set(h,'String',''); % clear the string
        drawnow;
        response_text = sprintf('''%s'' typed into box %i',response);
        fprintf('\t%s\n',response_text);
        fig.data.response = response;
        if ~isfield(fig.data,'responses')
            fig.data.responses = [];
            fig.data.text_handle = [];
        end
        fig.data.responses{end+1} = fig.data.response;
        
        i = numel(fig.data.responses);
        fig.data.text_handle(i) = text(...
            .5,.3-.05*(i-1),fig.data.responses{i},...
            'HorizontalAlignment','center',...
            'Color',fig.col.black,...
            'FontSize',20,'FontName','Calibri');
        set(gca,'Visible','off');
        sprintf('\t%s\n',response_text);
        
        drawnow;
        set(gcf,'UserData',fig);
end
end
%% saveSetup
function fig = saveSetup(fig)
fig.tmp.stack = dbstack;

if fig.set.get_inputs
    while 1
        fig.save.code = inputdlg('Participant number:','ID:');
        if ~isnan(str2double(fig.save.code))
            break
        end
    end
end

if ~isfield(fig,'save') && ~isfield(fig.save,'code') && isempty(fig.save.code)
    fig.save.code = {'9999'};
end

fig.save.code = fig.save.code{1};
fig.save.headers = {'code','trial','phase','stimulus','response','correct','reactiontime'};
fig.save.task_name = fig.tmp.stack(2).name;
fig.save.dir = fullfile([fileparts(which(fig.save.task_name)),'data']);

if ~exist(fig.save.dir,'dir')
    mkdir(fig.save.dir);
end

fig.save.number = 0;

while 1
    fig.save.number = fig.save.number + 1;
    fig.save.file_name = sprintf('%s_%s%i.dat',fig.save.code,fig.save.task_name,fig.save.number);
    fig.save.fullfile = fullfile(fig.save.dir,fig.save.file_name);
    
    if ~exist(fig.save.fullfile,'file')
        break
    end
end

fig.save.diary_file = sprintf('diary_%s_%i.txt',fig.save.code,fig.save.number);
fig.save.diary_fullfile = fullfile(fig.save.dir,fig.save.diary_file);
diary(fig.save.diary_fullfile);
fid = fopen(fig.save.fullfile,'w');

for i = 1 : numel(fig.save.headers)
    if i < numel(fig.save.headers)
        fprintf(fid,'%s\t',fig.save.headers{i});
    else
        fprintf(fid,'%s\n',fig.save.headers{i});
    end
end

% since the for loop has written in headers to the file
% fclose terminates 'w' access for fid
fclose(fid);

end


%% saveData
function fig = saveData(fig)

fid = fopen(fig.save.fullfile,'a');
fig.tmp.delim = '\t';

fig.tmp.responses = fig.data.response;
if isfield(fig.data,'responses') && ~isempty(fig.data.responses)
    fig.tmp.responses = fig.data.responses;
end
for j = 1 : numel(fig.tmp.responses)
    for i = 1 : numel(fig.save.headers)
        switch fig.save.headers{i}
            case 'response'
                if iscell(fig.tmp.responses)
                    fig.data.response = fig.tmp.responses{j};
                else
                    fig.data.response = fig.tmp.responses;
                end
        end
        fig.tmp.data = fig.data.(fig.save.headers{i});
        fig.tmp.format = '%s';
        if isnumeric(fig.tmp.data)
            fig.tmp.format = '%i';
            if floor(fig.tmp.data) < fig.tmp.data
                fig.tmp.format = '%3.2f';
            end
        end
        if i == numel(fig.save.headers)
            fig.tmp.delim = '\n';
        end
        fprintf(fid,[fig.tmp.format,fig.tmp.delim],fig.tmp.data);
    end
end
fclose(fid);

end
%% closeGui
function closeGui(~,~)

fprintf('Closing Gui: saving diary file\n');
diary off

return
end

