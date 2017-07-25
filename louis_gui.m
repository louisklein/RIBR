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
% clc;
% close all

% making a figure
fig.set.position = [.0 .0 1.0 1.0];
fig.set.run_n = 2; % []; % add number here to test the phases with X number of trials - leave empty for real experiment (ie full lists)
fig.col = myColours;
fig.set.background_colour = fig.col.grey;
fig.set.letter_pause_sec = 1;
fig.set.item_duration_sec = 8;
fig.set.item_inter_stimulus_interval_sec = 3;
fig.set.inter_phase_interval = 6;

fig.set.item_xy = [.5 .7];

fig.set.quit_key = '9';

% toggle test mode
fig.set.test_time = 1;
fig.set.get_inputs = 1;
if fig.set.test_time
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
    'FontName', 'Cambria',...
    'FontSize', 16,...
    'Position',[.4 .45 .2 .05],... % sets the position as a division of the figure size
    'CallBack',@getResponse,...
    'Tag','box',....
    'UserData',1,'Visible','off');

set(fig.h,'UserData',fig);

% now show the instructions
fig = runInstructions(fig);
pause(fig.set.inter_phase_interval)
% *** phase instrutions *** add here
% update the to-be-used list
fig.stim.list.use = fig.stim.lp.list.use;
fig = runStimList(fig);
pause(fig.set.inter_phase_interval)

% *** phase instrutions *** add here
runInstructions(fig,'phase_two');
% update the to-be-used list
fig.stim.list.use = fig.stim.rp.list.use;
fig = runPhase2(fig,'phase_two');
pause(fig.set.inter_phase_interval)

% *** phase instrutions *** add here
runInstructions(fig,'phase_three');
fig.stim.list.use = fig.stim.fr.list.use;
fig = runPhase3(fig,'phase_three');
pause(fig.set.inter_phase_interval)

% *** Complete - thank you! *** add here
runInstructions(fig,'finish');
delete(fig.h);

end


%% myColours
% - list of colours I might want to use
function col = myColours
col.black = [.05 .05 .05];
col.blue = [.3 .3 .8];
col.grey = [.99 .99 .99];
end

%% getKeyPress
function getKeyPress(h,event_data)
fig = get(h,'UserData');
%fprintf('\tKey pressed!!\n');

switch event_data.Key
    case [],...
        {'0','1','2'};
        switch fig.phase.current
            case {''}
                delete(get(gca,'Children'));
                switch event_data.Key
                    case '0'
                        runInstructions(fig);
                    case '1'
                        fig = runStimList(fig);
                    case '2'
                        fig = runPhase2(fig,'phase_two');
                    case '3'
                        fig = runPhase2(fig,'phase_three');
                end
            otherwise
                fprintf('I''m running %s, please wait until it''s finished or hit ''%s'' to quit\n',fig.phase.current,fig.set.quit_key);
                set(fig.h,'Name',sprintf('Running: %s',fig.phase.current));
        end
    case fig.set.quit_key
        delete(fig.h);
    otherwise
        fprintf('The ''%s'' key doesn''t do anything, yet...\n', event_data.Key)
end
set(h,'UserData',fig);
% pause(fig.set.letter_pause_sec);
% delete(text_handle);
end

%%  runInstructions
function  fig = runInstructions(fig,in_phase)
fig.tmp.stack = dbstack;
fig.phase.current = fig.tmp.stack(1).name;

fig.instruct.continue = 'Press ''Space Bar'' to continue.';
fig.instruct.continue_format = '\n\n%s';
fig.instruct.texts = {...
    {'In the first phase of the experiment you will be presented with a series of statements on the screen.',... % instruction 1: line 1
    'Each statement will appear for several seconds before disappearing, so it is important that you pay close attention.',... % instruction 1: line 2
    'You need to read each statement carefully while it is on the screen.'},... % instruction 1: line 3
    {'We are subtly manipulating the brightness of each statement, however these changes should be difficult for you to detect. '... % instruction 2: line 1
    }...
    {'You are now ready to start the experiment'} ...
%     {'Press ''0'' to see instructions again',...
%     'Press ''1'' to run phase 1',...
%     'Press ''2'' to run phase 2'} ...
    };
if exist('in_phase','var') && ~isempty(in_phase)
    switch in_phase
        case 'phase_two'
            fig.instruct.texts = {...
                {'Here comes phase 2!'},... % instruction 1: line 1
                };
        case 'phase_three'
            fig.instruct.texts = {...
                {'Here comes phase 3!'},... % instruction 1: line 1
                };
%         case 'phase_final'
%             fig.instruct.texts = {...
%                 {'Here comes final phase'},...
%                 };
        case 'finish'
            fig.instruct.texts = {...
                {'That''s all folks!','Thank you :)'},... % instruction 1: line 1
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

% fig.instruct.text = {... sprintf('%s\n\n%s',fig.instruct.texts{1},fig.instruct.continue),...
%     sprintf([repmat('%s\n\n',1,numel(fig.instruct.texts{1})),fig.instruct.continue_format],... % create formatting string
%     fig.instruct.texts{1}{:},fig.instruct.continue),...
%     sprintf([repmat('%s\n\n',1,numel(fig.instruct.texts{2})),fig.instruct.continue_format],...
%     fig.instruct.texts{2}{:},fig.instruct.continue),... sprintf('%s\n\n%s',fig.instruct.texts{2},fig.instruct.continue),...
%     sprintf(['Press ''0'' to see instructions again\n',...
%     'Press ''1'' to run phase 1\n',...
%     'Press ''2'' to run phase 2'])};
set(fig.h,'UserData',fig);
for i = 1 : numel(fig.instruct.text)
%     fig.phase.running = 1;
    fig.tmp.text_handle = text(...
        .5,.5,fig.instruct.text{i},...
        'HorizontalAlignment','center');
    set(gca,'Visible','off');
%     if i < numel(fig.instruct.text)
        waitforbuttonpress; %(fig.h);
        delete(fig.tmp.text_handle);
%     end
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
% ...
%     'PlotBoxAspectRatioMode','manual',...
%     'PlotBoxAspectRatio',[1,1,1],...
%     'DataAspectRatioMode','manual',...
%     'DataAspectRatio',[1 1 1],...
%     'Visible','on');

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
                strrep(fig.stim.list.use{i},'_','\_'),...fig.stim.list.use{i},...
                'Parent',makeaxes,'Units','Normalized',...
                'HorizontalAlignment','center',...
                'BackgroundColor',fig.set.background_colour,...
                'Color',fig.col.black,...
                'Visible','on',...
                'FontSize',25,'FontName','Cambria');
        catch err
            delete(fig.h);
            error('Axes gone!!');
            % error('Program terminated for a specific reason')
        end
        pause(fig.set.item_duration_sec);
        delete(text_handle);
        pause(fig.set.item_inter_stimulus_interval_sec)
    end
else
    warndlg('Can''t find list!!');
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
fig.data.phase_three_responses = [];

fig.tmp.n = numel(fig.stim.list.use);
if ~isempty(fig.set.run_n)
    fig.tmp.n = fig.set.run_n;
end
for i = 1 : fig.tmp.n
    fprintf('\t (%s) %i: %s\n',phase_name,i,fig.stim.list.use{i});
    
%     fig.save.headers = {'code','trial','stimulus','reactiontime','response'};
    
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
            strrep(fig.data.stimulus,'_','\_'),...fig.data.stimulus,...
            'Parent',gca,'Units','Normalized',...
            'HorizontalAlignment','center',...
            'BackgroundColor',fig.set.background_colour,...
            'Color',fig.col.black,...
            'FontSize',25,'FontName','Cambria');
    catch err
        delete(fig.h);
        error('Axes gone!!');
        % error('Program terminated for a specific reason')
    end

    set(fig.tmp.edit_box,'Visible','On');
    uicontrol(fig.tmp.edit_box);
    while 1
        fig = get(fig.h,'UserData');
        if isfield(fig,'data')
            switch fig.data.response
                case 'empty'
                    % keep waiting for a response
                case 'quit4menow'
                    delete(fig.h);
                otherwise
                    if strcmpi(fig.data.response,fig.data.stimulus)
                        fig.data.correct = 1;
                    end
                    break
            end
        end
        pause(.1);
    end
    fig.data.reactiontime = toc;
    tic;
%     figure(fig.h); % stop focussing on text box
    set(fig.tmp.edit_box,'Visible','Off');
    delete(text_handle);
    set(fig.tmp.edit_box,'String','');

    % save the data
    fig = saveData(fig);
    
    
    switch phase_name
        case 'phase_three'
            fig.data.phase_three_responses{end+1} = fig.data.response;
    end
    while toc < fig.set.item_inter_stimulus_interval_sec
        
        pause(.1);
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
fig.data.phase_two_responses = [];

fig.tmp.n = numel(fig.stim.list.use);
if ~isempty(fig.set.run_n)
    fig.tmp.n = fig.set.run_n;
end
for i = 1 : fig.tmp.n
    fprintf('\t (%s) %i: %s\n',phase_name,i,fig.stim.list.use{i});
    
%     fig.save.headers = {'code','trial','stimulus','reactiontime','response'};
    
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
            strrep(fig.data.stimulus,'_','\_'),...fig.data.stimulus,...
            'Parent',gca,'Units','Normalized',...
            'HorizontalAlignment','center',...
            'BackgroundColor',fig.set.background_colour,...
            'Color',fig.col.black,...
            'FontSize',25,'FontName','Cambria');
    catch err
        delete(fig.h);
        error('Axes gone!!');
        % error('Program terminated for a specific reason')
    end

    set(fig.tmp.edit_box,'Visible','On');
    uicontrol(fig.tmp.edit_box);
    while 1
        fig = get(fig.h,'UserData');
        if isfield(fig,'data')
            switch fig.data.response
                case 'empty'
                    % keep waiting for a response
                case 'quit4menow'
                    delete(fig.h);
                otherwise
                    if strcmpi(fig.data.response,fig.data.stimulus)
                        fig.data.correct = 1;
                    end
                    break
            end
        end
        pause(.1);
    end
    fig.data.reactiontime = toc;
    tic;
%     figure(fig.h); % stop focussing on text box
    set(fig.tmp.edit_box,'Visible','Off');
    delete(text_handle);
    set(fig.tmp.edit_box,'String','');

    % save the data
    fig = saveData(fig);
    
    
    switch phase_name
        case 'phase_three'
            fig.data.phase_three_responses{end+1} = fig.data.response;
    end
    while toc < fig.set.item_inter_stimulus_interval_sec
        
        pause(.1);
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

switch phase
    case 'rp'
        % first three characters are causing us issues - we've no idea
        % where they've come from and hate them! This will remove them.
        while ~strcmpi(fig.stim.(phase).headers{1}(1),'F')
            fig.stim.(phase).headers{1}(1) = [];
        end
    case 'lp'
        % first three characters are causing us issues - we've no idea
        % where they've come from and hate them! This will remove them.
        while ~strcmpi(fig.stim.(phase).headers{1}(1),'F')
            fig.stim.(phase).headers{1}(1) = [];
        end
        % added another case for the Final_Recall phase hashtag may not
        % work as intended
    case 'fr'
        while ~strcmpi(fig.stim.(phase).headers{1}(1),'F')
            fig.stim.(phase).headers{1}(1) = [];
        end
end

fig.stim.(phase).list = [];
%     fig.stim.(phase).list.FA1 = [];
%     fig.stim.(phase).list.FA2 = [];

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
function getResponse(h,event)

fig = get(gcf,'UserData');
fprintf('Response:');
response = get(h,'String');
response_text = sprintf('''%s'' typed into box %i',response);

% opens a warning that displays response_text
% warndlg(response_text,'Response!');

fprintf('\t%s\n',response_text);
fig.data.response = response;
set(gcf,'UserData',fig);
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

% since the for loop has written in headers to the file, fclose terminates
% 'w' access for fid
fclose(fid);

end


%% saveData
function fig = saveData(fig)

fid = fopen(fig.save.fullfile,'a');
fig.tmp.delim = '\t';

for i = 1 : numel(fig.save.headers)
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

fclose(fid);

end
%% closeGui
function closeGui(~,~)

fprintf('Closing Gui: saving diary file\n');
diary off
% error('Yep, I''m closing...');
return
end
