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
fig.col = myColours;
fig.set.background_colour = fig.col.grey;
fig.set.letter_pause_sec = 1;
fig.set.item_duration_sec = 8;
fig.set.item_inter_stimulus_interval_sec = 3;

% toggle test mode
fig.set.test_time = 0;
fig.set.get_inputs = 1;
if fig.set.test_time
    fig.set.letter_pause_sec = .5;
    fig.set.item_duration_sec = .5;
    fig.set.item_inter_stimulus_interval_sec = .5;
end
%% read in stim file

fig.stim.file = 'Retrieval_Practise.csv';
fig.stim.dir = fileparts(which(mfilename));
fig.stim.fullfile = fullfile(fig.stim.dir,fig.stim.file);
fig = readStimFile(fig);
fig.stim.list.use = fig.stim.list.FA1;

%% save settings
% fig.tmp.current_dir = pwd;
% cd(fullfile(pwd,'..'));
% fullfile(pwd,[mfilename,'_data']); %[pwd,'Data'];
% cd(fig.tmp.current_dir); % change back to original dir.

% this loop sets a directory which will be saved to - first it checks if
% there is a current data file, if there is none it will create one before
% terminating.
% why is the save.dir pointing to stim.dir?
fig.save.dir = [fig.stim.dir,'data']; 
if ~exist(fig.save.dir,'dir')
    mkdir(fig.save.dir);
end

fig.save.code = '9999';
if fig.set.get_inputs 
fig.save.code = inputdlg('Participant number:','ID:');
end


fig.save.diary_file = sprintf('%s_diary.txt',fig.save.code{:});
fig.save.diary_fullfile = fullfile(fig.save.dir,fig.save.diary_file);
diary(fig.save.diary_fullfile);

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
    'UserData',1);

set(fig.h,'UserData',fig);
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
fprintf('\tKey pressed!!\n');
text_handle = text(.5,.5,event_data.Key,'BackgroundColor',fig.set.background_colour,'Color', fig.col.black);
parent_handle = get(text_handle,'Parent');

set(parent_handle,'Color',fig.set.background_colour);
set(parent_handle,'Visible','off');
pause(fig.set.letter_pause_sec);
% why is this both before and after the switch?
delete(text_handle);
% this case switching doesn't seem to be used
switch event_data.Key
    case 'b'
        fig = runStimList(fig);
    otherwise
        fprintf('That key doesn''t do anything, yet...\n')
end
pause(fig.set.letter_pause_sec);
delete(text_handle);
end

%% runStimList
function fig = runStimList(fig)
fprintf('Attempting to run list:\n');
% checks that the correct directory is being read
if isfield(fig,'stim') && isfield(fig.stim,'list') && isfield(fig.stim.list,'use')
    % loops between i and the number of elements in the stimulus list,
    % although it's not really a loop so much as a set of operations which
    % are indicated by the vector of length i : numel(etc)
   for i = 1 : numel(fig.stim.list.use)
       % prints a log in the command window for each i
       fprintf('\t%i: %s\n',i,fig.stim.list.use{i});
       text_handle = text(.43,.6,fig.stim.list.use{i},...
                        'Units','Normalized',... 
                        'Position',[.4 .45 .2 .05],...
                        'BackgroundColor',fig.set.background_colour,...
                        'Color',fig.col.black,...
                        'FontSize',25,'FontName','Cambria');
       % checks how long to display each element in fig.stim.list.use
       % according to the pause handle we set earlier
       pause(fig.set.item_duration_sec);
       % since text_handle is defined in the getKeyPress function, is it
       % within range of this function? because the switch doesn't seem to
       % work, maybe the function isn't being run?
       delete(text_handle);
       pause(fig.set.item_inter_stimulus_interval_sec)
   end
else
   warndlg('Can''t find list!!');
end
fprintf('Finished\n');
end

%% readStimFile
function fig = readStimFile(fig)
% prints helpful line to the command window, useful in debugging
fprintf('Running ''readStimFile'' on: %s (%s)\n',fig.stim.file,fig.stim.dir);
% says that whenever fig.stim.data is used, read the information from the
% file 
fig.stim.data = importdata(fig.stim.fullfile,',');
fig.stim.headers = [];
% not clear on why this while loop is bypassed? tried to run it, but it
% prevents the figure from displaying and couldn't debug
% while 1
    remaining_text = fig.stim.data{1};
    while ~isempty(remaining_text)
    [fig.stim.headers{end+1},remaining_text] = strtok(remaining_text,',');
    end
    % what does the empty bracket do?
    fig.stim.list = [];
%     fig.stim.list.FA1 = [];
%     fig.stim.list.FA2 = [];
%     etc.

    for i = 1 : numel(fig.stim.headers)
        fig.stim.list.(fig.stim.headers{i}) = [];
    end

    for i = 2 : size(fig.stim.data,1)
        rem = fig.stim.data{i};
        for j = 1 : numel(fig.stim.headers)
            [fig.stim.list.(fig.stim.headers{j}){end+1},rem] = strtok(rem,',');
        end
    end
% end
% fig.stim.data = readtable(fig.stim.fullfile,'Delimiter',',');%,'Header',1);
fprintf('\tdone.\n');
end

%% getResponse
function getResponse(h,event)
% gets the current figure - which is h - and asks for UserData which is a
% vector that has stored information
fig = get(gcf,'UserData');
fprintf('Response:');
% handle stores whatever information in figure h has with string properties
response = get(h,'String');

% handle stores the print command
response_text = sprintf('''%s'' typed into box %i',response);
% opens a warning that displays response_text 
% warndlg(response_text,'Response!');
% this just prints the same line to the command window for debugging
fprintf('\t%s\n',response_text);
% this tells the get inside the response handle to look at the file
% associated with the UserData of the current figure
fig.data.response = response;
% sets the value of the current figure to be whatever is in fig, which is
% UserData in the current figure, with the tag UserData
% tbh not exactly sure what this is doing...
set(gcf,'UserData',fig);
end

%% closeGui
function closeGui(~,~)
% this turns off the diary, since the diary is associated with
% file.stim.dir and that is the handle for the current file which is unique
% to the participant, when the program runs again with a new participant
% id, the diary will start afresh
diary off
return
end

% why is this here?
%linspace(.2,.8,5)