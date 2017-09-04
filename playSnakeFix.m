%% playSnake;
function fig = playSnakeFix(fig,varargin)

% set(0,'RecursionLimit',10000);
fig.snake.testing = 0;
if ~exist('fig','var') || ~isfield(fig,'h')
    clear;
    clc;
    close all
    fig.snake.testing = 0;
    fig.h = figure('menubar','none','units','normalized','position',[0 0 .9 .9]);
    
end

fig.snake.stop = 'timeout'; %'number_plays'; %
fig.snake.timeout = 5; %240;
if exist('varargin','var') && ~isempty(varargin)
    fig.snake.timeout = varargin{1};
end
fig.snake.number_plays = 3;
fig.snake.number_plays_count = 0;

fig.snake.comment = 0;
%Size of the 'playing field'.
fig.snake.xmax = 100;
fig.snake.ymax = 100;

fig.snake.keypress = [];
%Starting position.
fig = snakeReset(fig);
% fig.snake.x = 15;
% fig.snake.y = 15;
% fig.snake.grid(fig.snake.x,fig.snake.y) = 1;
%
% fig.snake.mylength = 1;     %fig.snake.mylength of snake
% fig.snake.positionX = zeros(fig.snake.mylength);  %array holds all the coordinates
% fig.snake.positionY = zeros(fig.snake.mylength);  %  of the snake's body elements
% fig.snake.positionX(1) = fig.snake.x;
% fig.snake.positionY(1) = fig.snake.y;
%
% %Position of the food.
% fig.snake.xfood = fig.snake.x;
% fig.snake.yfood = fig.snake.y;
% fig = getNewFood(fig);
%
% fig.snake.justGotFoodFlag = 0;
% fig.snake.gameover = 0;


tic
fig.snake.starttime = toc;
fig.snake.quit = 0;
set(fig.h,'UserData',fig);
% waitforbuttonpress;
while ~fig.snake.quit % (fig.snake.starttime+toc) < fig.snake.timeout &&
    pause(.001);
%     if ~isempty(fig.snake.keypress) %|| ~strcmpi(fig.snake.keypress,fig.snake.lastkeypress)
        updatePosition;
        
%     end
    % check the data to see if the game has finished running - this is just
    % a holding sequence to make sure the function doesn't end before we
    % want it to - otherwise, code later in the louis_gui script will run
    fig = get(fig.h,'UserData');
end
switch fig.snake.stop
    case 'timeout'
        fprintf('Elapsed time = %3.2f (timeout = %i)\n',toc,fig.snake.timeout);
    case 'number_plays'
        fprintf('Completed %i plays\n',fig.snake.number_plays);
end
% fig.snake.grid(:,:) = 0;
% set(fig.h,'CurrentObject',imagesc(fig.snake.grid));
% fig = snakeGameOver(fig);
set(fig.h,'KeyPressFcn','');
delete(gca);
% if 
end
%% Called for any key press.
function keyPress(~,evt)
fig = get(gcf,'UserData');
fig.snake.keypress = evt.Key;
set(gcf,'UserData',fig);
% pause(.001);
% makeMovement;%(evt.Key);
% set(gcf,'KeyPressFcn','');
% youGottaMove(evt.Key);
% set(gcf,'KeyPressFcn',@keyPress);
% set(fig.h,'UserData',fig);


% >>>>
% fig = get(gcf,'UserData');
%
% while ~fig.snake.quit % (fig.snake.starttime+toc) < fig.snake.timeout
%     pause(0.1);
%     fig = get(gcf,'UserData');
%     if ~fig.snake.quit
% <<<<<<<<<

%     if isempty(get(gcf,'KeyPressFcn'))
%         if fig.snake.comment; fprintf('\tKeypress function empty - keyPress\n'); end
%         break
%     elseif fig.snake.gameover
%         if fig.snake.comment; fprintf('\tBut not timed out yet - keyPress\n'); end
%         %         fig.snake.gameover = 0;
%         % restart
%         fig = snakeReset(fig);
%         set(gcf,'UserData',fig);
%         %         break
%         youGottaMove('a'); % dummy
%     else
%         youGottaMove;%(evt.Key);
%         if fig.snake.quit
%            youGottaMove('a'); % dummy
%         end
%     end
% >>>>>
%         fig = get(gcf,'UserData');
%     end
%     if ~fig.snake.quit
%         switch fig.snake.stop
%             case 'timeout'
%                 if (fig.snake.starttime+toc) > fig.snake.timeout
%                     fig.snake.quit = 1;
%                 end
% %             case 'number_plays'
% %                 tic;
% %                 if fig.snake.number_plays_count == fig.snake.number_plays
% %                     fig.snake.quit = 1;
% %                 end
%         end
%     end
% end
% <<<<<<<<<
% if ~fig.snake.quit
%     return
% end
% switch fig.snake.stop
%     case 'timeout'
%         fprintf('Timed out: %3.2f\n',fig.snake.timeout);
%     case 'number_plays'
%         fprintf('Completed %i plays\n',fig.snake.number_plays);
% end
end


%% Called after a keypress (not any more 22-Aug-2017)
% don't think this happens: or after timedelay (?? timedelay??)
function youGottaMove %(mov)
% set(gcf,'KeyPressFcn','');
fig = get(gcf,'UserData');
mov = fig.snake.keypress;
if ~isfield(fig.snake,'youGottaMove_n')
    fig.snake.youGottaMove_n = 0;
end
fig.snake.youGottaMove_n = fig.snake.youGottaMove_n + 1;
set(gcf,'UserData',fig);
if fig.snake.comment; fprintf('You gotta move: %i\n',fig.snake.youGottaMove_n); end

% makeMovement(mov);
% get updated information
fig = get(gcf,'UserData');
% set(fig.h,'UserData',fig);
if ~isempty(mov) && ~fig.snake.quit && exist('fig','var') && ~isempty(fig) && isfield(fig,'snake') ...
        && isfield (fig.snake,'gameover') && ~fig.snake.gameover
%     fig = checkBody(fig);
    if ~fig.snake.quit %%~fig.snake.gameover &&
        fig.snake.justGotFoodFlag = 0;
        
        fig.snake.grid(fig.snake.positionX(1),fig.snake.positionY(1)) = fig.snake.col.background;
        
        if (fig.snake.mylength~=1)
            for i = 1:fig.snake.mylength-1
                fig.snake.positionX(i) = fig.snake.positionX(i+1);
                fig.snake.positionY(i) = fig.snake.positionY(i+1);
            end
        end
        
        fig.snake.positionX(fig.snake.mylength) = fig.snake.x;
        fig.snake.positionY(fig.snake.mylength) = fig.snake.y;
        
        fig = checkPosEqFood(fig);
        if fig.snake.x > 0 && fig.snake.x <= size(fig.snake.grid,2) && ...
                fig.snake.y > 0 && fig.snake.y <= size(fig.snake.grid,1)
            fig.snake.grid(fig.snake.x,fig.snake.y) = fig.snake.col.snake;
        else
            if fig.snake.comment; fprintf('Position problem: x = %i, y = %i, dim = %i %i\n',...
                    fig.snake.x,fig.snake.y, size(fig.snake.grid)); end
            %             keyboard;
        end
        %         try
        if fig.snake.comment; fprintf('Try set image - youGottaMove\n'); end
        set(fig.h,'CurrentObject',imagesc(fig.snake.grid));
        set(gca,'Visible','off');
%         pause(.001);
        %         end
    end
    %     if (fig.snake.starttime+toc) > fig.snake.timeout
    %         fig.snake.quit = 1;
    %     end
    %     try
    %     if fig.snake.comment; fprintf('Try set fig - youGottMove\n'); end
    set(fig.h,'UserData',fig);
    %     end
end
fig.snake.lastkeypress = mov;
% set(gcf,'KeyPressFcn',@keyPress);

end
%% calculate the position of the snake
function updatePosition
% makeMoveStart = toc;
fig = get(gcf,'UserData');
mov = fig.snake.keypress;
if fig.snake.comment; fprintf('\tmakeMovement\n'); end

if ~fig.snake.quit && exist('fig','var') && ~isempty(fig) && isfield(fig,'snake') ...
        && isfield (fig.snake,'gameover') && ~fig.snake.gameover
    % tmp = 1;
    % while 1 % tmp
    set(gca,'Visible','off');
    if ~isempty(mov)
        switch(mov)
            case 'downarrow'
                if (fig.snake.x==fig.snake.xmax)
                    fig.snake.reason = 'off to bottom';
                    fig = snakeGameOver(fig);
                    %                 break;
                else
                    fig.snake.x=fig.snake.x+1;
                end
            case 'uparrow'
                if (fig.snake.x==1)
                    fig.snake.reason = 'off the top';
                    fig = snakeGameOver(fig);
                    %                 break;
                else
                    fig.snake.x=fig.snake.x-1;
                end
            case 'rightarrow'
                if (fig.snake.y==fig.snake.ymax)
                    fig.snake.reason = 'off to right';
                    fig = snakeGameOver(fig);
                    %                     break;
                else
                    fig.snake.y=fig.snake.y+1;
                end
            case 'leftarrow'
                if (fig.snake.y==1)
                    fig.snake.reason = 'off to left';
                    fig = snakeGameOver(fig);
                    %                 break;
                else
                    fig.snake.y=fig.snake.y-1;
                end
            case 'q'
                delete(fig.h);
            otherwise
                % any other key is pressed - keep going
                %             break
        end
    end
     fig = checkBody(fig);
    %     if ~fig.snake.quit % ~fig.snake.gameover
    %         try
    %     if fig.snake.comment; fprintf('Try set fig - makeMovement\n'); end
    % if ~fig.snake.quit
        switch fig.snake.stop
            case 'timeout'
                if (fig.snake.starttime+toc) > fig.snake.timeout
                    fig.snake.quit = 1;
                end
            case 'number_plays'
                tic;
                if fig.snake.number_plays_count == fig.snake.number_plays
                    fig.snake.quit = 1;
                end
        end
    end
% end
    set(fig.h,'UserData',fig);
    %         end
    %     end
%     while toc - makeMoveStart < .05
%     end
youGottaMove;

%     tmp = 0;
% end
end

%% Moves the position of the snake in direction of 'mov' (key)
function makeMovement(mov)
% makeMoveStart = toc;
fig = get(gcf,'UserData');
if fig.snake.comment; fprintf('\tmakeMovement\n'); end

if ~fig.snake.quit && exist('fig','var') && ~isempty(fig) && isfield(fig,'snake') ...
        && isfield (fig.snake,'gameover') && ~fig.snake.gameover
    % tmp = 1;
    % while 1 % tmp
    set(gca,'Visible','off');
    if ~isempty(mov)
        switch(mov)
            case 'downarrow'
                if (fig.snake.x==fig.snake.xmax)
                    fig.snake.reason = 'off to bottom';
                    fig = snakeGameOver(fig);
                    %                 break;
                else
                    fig.snake.x=fig.snake.x+1;
                end
            case 'uparrow'
                if (fig.snake.x==1)
                    fig.snake.reason = 'off the top';
                    fig = snakeGameOver(fig);
                    %                 break;
                else
                    fig.snake.x=fig.snake.x-1;
                end
            case 'rightarrow'
                if (fig.snake.y==fig.snake.ymax)
                    fig.snake.reason = 'off to right';
                    fig = snakeGameOver(fig);
                    %                     break;
                else
                    fig.snake.y=fig.snake.y+1;
                end
            case 'leftarrow'
                if (fig.snake.y==1)
                    fig.snake.reason = 'off to left';
                    fig = snakeGameOver(fig);
                    %                 break;
                else
                    fig.snake.y=fig.snake.y-1;
                end
            case 'q'
                delete(fig.h);
            otherwise
                % any other key is pressed - keep going
                %             break
        end
    end
   
    %     if ~fig.snake.quit % ~fig.snake.gameover
    %         try
    %     if fig.snake.comment; fprintf('Try set fig - makeMovement\n'); end
    set(fig.h,'UserData',fig);
    %         end
    %     end
%     while toc - makeMoveStart < .05
%     end
end
%     tmp = 0;
% end
end

%% Checks if new position is part of snake's body
function fig = checkBody(fig)
if ~fig.snake.quit && (fig.snake.mylength>1)
    for i = 1 : fig.snake.mylength-fig.snake.justGotFoodFlag
        if (fig.snake.x == fig.snake.positionX(i)) && (fig.snake.y == fig.snake.positionY(i))
            fig.snake.reason = 'You ate yourself!';
            if fig.snake.comment; fprintf('Eating own body! - checkBody\n'); end
            fig = snakeGameOver(fig);
            break
        end
    end
end

end

%% Check if you've reached the food
function fig = checkPosEqFood(fig)

if (fig.snake.x==fig.snake.xfood)&&(fig.snake.y==fig.snake.yfood) || ...
    and(and(fig.snake.x >= fig.snake.xfood,fig.snake.x <= fig.snake.xfood+fig.snake.food_size),...
        and(fig.snake.y >= fig.snake.yfood,fig.snake.y <= fig.snake.yfood+fig.snake.food_size))
    fig.snake.mylength = fig.snake.mylength + 1;
    fig.snake.positionX(fig.snake.mylength) = fig.snake.x;
    fig.snake.positionY(fig.snake.mylength) = fig.snake.y;
    fig.snake.grid(fig.snake.xfood:fig.snake.xfood+fig.snake.food_size,fig.snake.yfood:fig.snake.yfood+fig.snake.food_size) = fig.snake.col.background;
    fig = getNewFood(fig);
    fig.snake.justGotFoodFlag = 1;
end
end

%% Create new food element
function fig = getNewFood(fig)
flag = 1;
while (flag)
    fig.snake.xfood = randi(fig.snake.xmax);
    fig.snake.yfood = randi(fig.snake.ymax);
    flag = 0;
    for i = 1 : fig.snake.mylength
        if (fig.snake.xfood == fig.snake.positionX(i)) && ...
                (fig.snake.yfood==fig.snake.positionY(i))
            flag = 1;
        end
    end
end
% fig.snake.grid(fig.snake.xfood,fig.snake.yfood) = 0.5;
fig.snake.grid(fig.snake.xfood:fig.snake.xfood+fig.snake.food_size,fig.snake.yfood:fig.snake.yfood+fig.snake.food_size) = fig.snake.col.food;
end
%% snakeReset
function fig = snakeReset(fig)

fig.snake.col.snake = .7;
fig.snake.col.food = 1;
fig.snake.col.background = 0;
fig.snake.col.gameover = .2;

fprintf('Resetting Snake:\n');
fig.snake.x = fig.snake.xmax*.5;
fig.snake.y = fig.snake.ymax*.5;
fig.snake.grid = ones(fig.snake.xmax,fig.snake.ymax)*fig.snake.col.background;
fig.snake.grid(fig.snake.x,fig.snake.y) = fig.snake.col.snake;

fig.snake.mylength = 1;     %fig.snake.mylength of snake
fig.snake.positionX = zeros(fig.snake.mylength);  %array holds all the coordinates
fig.snake.positionY = zeros(fig.snake.mylength);  %  of the snake's body elements
fig.snake.positionX(1) = fig.snake.x;
fig.snake.positionY(1) = fig.snake.y;

%Position of the food.
fig.snake.xfood = fig.snake.x;
fig.snake.yfood = fig.snake.y;

fig.snake.food_size = 8;
fig = getNewFood(fig);

fig.snake.justGotFoodFlag = 0;
fig.snake.gameover = 0;

% ADJUST THE SIZE AND POSITION HERE IF DESIRED.
% set(fig.h,'position',[50 50 200 200]);

set(fig.h,'CurrentObject',imagesc(fig.snake.grid));
set(fig.h,'KeyPressFcn',@keyPress);
set(gca,'Visible','off');
drawnow;
% if  snake.number_plays_count == fig.snake.number_plays
%     return
% end
end
%%
% function doNothing(~,~)
% end

%% Closes things up.
function fig = snakeGameOver(fig)
% fig = get(gcf,'UserData');
% try
% set(fig.h,'KeyPressFcn',@doNothing);
fig.snake.grid(:,:) = fig.snake.col.gameover;
set(fig.h,'CurrentObject',imagesc(fig.snake.grid));
set(gca,'Visible','off');
pause(1);
fig.snake.gameover_msg = sprintf('Game Over, person! %s',fig.snake.reason);
fprintf('%s\n',fig.snake.gameover_msg);
pause(1);
%     waitfor(warndlg(fig.snake.gameover_msg,'Game over:'));
fig.snake.gameover = 1;
fig.snake.number_plays_count = fig.snake.number_plays_count + 1;

switch fig.snake.stop
    case 'timeout'
        fprintf('\tElapsed time = %3.2f (timeout = %3.2f, number plays = %i)\n',...
            toc,fig.snake.timeout,fig.snake.number_plays_count);
        if (fig.snake.starttime+toc) > fig.snake.timeout
            fig.snake.quit = 1;
        end
    case 'number_plays'
        tic; % reset the timer so never timesout
        fprintf('\tNumber of plays = %i (out of %i, total time = %3.2f)\n',...
            fig.snake.number_plays_count,fig.snake.number_plays,toc);
        if fig.snake.number_plays_count == fig.snake.number_plays
            fig.snake.quit = 1;
        end
end
set(fig.h,'UserData',fig);
if ~fig.snake.quit
    fig = snakeReset(fig);
else
    if fig.snake.testing
        delete(fig.h);
    end
end
end


