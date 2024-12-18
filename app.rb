require 'sinatra'

enable :sessions

WORDS = File.readlines(File.join(settings.root, 'public', 'words.txt'), chomp: true).select { |word| word.length == 5 }

before do
  session[:game] ||= {
    target: WORDS.sample.upcase,
    guesses: Array.new(6) { "" },
    feedback: Array.new(6) { [] },
    curr_row: 0,
    game_over: false,
    correct_guess: false,
  }
end

# root route
get '/' do
  erb :index
end

get '/instructions' do
  erb :instructions
end

get '/play' do
  erb :play
end

get '/result' do
  erb :result
end

post '/guess' do
  content_type :json

  # parse json
  request_payload = request.body.read
  params = JSON.parse(request_payload) rescue {}

  guess = params["guess"]&.upcase
  game = session[:game]

  puts "Word: #{session[:game][:target]}"


  # determine game status
  if game[:game_over]
    { error: "game over" }.to_json
  elsif !WORDS.include?(guess.downcase)
    { error: "invalid word" }.to_json
  else
    feedback = check_guess(guess, game[:target])
    # update game stats
    game[:guesses][game[:curr_row]] = guess
    game[:feedback][game[:curr_row]] = feedback
    game[:curr_row] += 1

    # update game status
    if guess == game[:target]
      game[:game_over] = true
      { message: "success", game: game }.to_json
    elsif game[:curr_row] >= 6
      game[:game_over] = true
      { message: "fail", game: game }.to_json
    else
      { game: game }.to_json
    end
  end 
end

def check_guess(guess, target)
  feedback = Array.new(5, :absent)  # initial feedback at empty
  target_chars = target.chars

  # check for exact matches to target
  guess.chars.each_with_index do |char, index|
    if char == target_chars[index]
      feedback[index] = :correct
      target_chars[index] = nil  # mark chars as checked
    end
  end

  # check for present chars, but wrong position
  guess.chars.each_with_index do |char, index|
    if feedback[index] == :absent && target_chars.include?(char)
      feedback[index] = :present
      target_chars[target_chars.index(char)] = nil # mark chars as checked
    end
  end

  feedback
end

